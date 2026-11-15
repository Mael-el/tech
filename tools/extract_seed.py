import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'app/src/main/java/com/example/data/repository/AfricaSkillsRepository.kt').read_text(encoding='utf-8')

def blocks(name):
    out = []
    for m in re.finditer(r'\b' + re.escape(name) + r'\(', src):
        i = m.end()
        depth = 1
        in_str = False
        esc = False
        start = i
        while i < len(src) and depth > 0:
            c = src[i]
            if in_str:
                if esc: esc = False
                elif c == '\\': esc = True
                elif c == '"': in_str = False
            else:
                if c == '"': in_str = True
                elif c == '(': depth += 1
                elif c == ')': depth -= 1
            i += 1
        out.append(src[start:i-1])
    return out

def parse(body):
    fields, buf, depth, in_str, esc = [], '', 0, False, False
    for c in body:
        if in_str:
            buf += c
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == '"': in_str = False
            continue
        if c == '"': in_str = True; buf += c
        elif c in '([{': depth += 1; buf += c
        elif c in ')]}': depth -= 1; buf += c
        elif c == ',' and depth == 0: fields.append(buf.strip()); buf = ''
        else: buf += c
    if buf.strip(): fields.append(buf.strip())

    d = {}
    for f in fields:
        m = re.match(r'(\w+)\s*=\s*(.*)$', f, re.S)
        if not m: continue
        k, v = m.group(1), m.group(2).strip()
        if v.startswith('"'):
            s = json.loads(v[v.index('"'):])
            d[k] = s
        elif v in ('true', 'false'):
            d[k] = v == 'true'
        elif v == 'null':
            d[k] = None
        elif re.fullmatch(r'-?\d[\d_]*', v):
            d[k] = int(v.replace('_', ''))
        elif re.fullmatch(r'-?\d[\d_]*\.\d+', v):
            d[k] = float(v.replace('_', ''))
        elif v.startswith('DomainType.'):
            d[k] = v[len('DomainType.'):-len('.id')]
        elif v.startswith('BadgeTier.'):
            d[k] = v[len('BadgeTier.'):-len('.name')]
        else:
            d[k] = v
    return d

profile = parse(blocks('UserProfileEntity')[0])
courses = [parse(b) for b in blocks('CourseEntity')]
lessons = [parse(b) for b in blocks('LessonEntity')]
cards = [parse(b) for b in blocks('FlashcardEntity')]
badges = [parse(b) for b in blocks('BadgeEntity')]
atts = [parse(b) for b in blocks('AttestationEntity')]
jobs = [parse(b) for b in blocks('JobEntity')]
projects = [parse(b) for b in blocks('ProjectEntity')]
msgs = [parse(b) for b in blocks('CommunityMessageEntity')]

for l in lessons:
    l['options'] = l.pop('quizOptionsSerialized').split('|')
for c in cards:
    c.pop('nextReviewEpochMs', None)
    c.pop('lastReviewedEpochMs', None)

data = {
    'profile': profile,
    'courses': courses,
    'lessons': lessons,
    'flashcards': cards,
    'badges': badges,
    'attestations': atts,
    'jobs': jobs,
    'projects': projects,
    'messages': msgs,
}
json.dump(data, open(ROOT / 'web/src/data/seed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print({k: (len(v) if isinstance(v, list) else 1) for k, v in data.items()})

# --- domaines & tiers depuis Models.kt -------------------------------------
models = (ROOT / 'app/src/main/java/com/example/data/model/Models.kt').read_text(encoding='utf-8')
color_src = (ROOT / 'app/src/main/java/com/example/ui/theme/Color.kt').read_text(encoding='utf-8')
colors = dict(re.findall(r'val (\w+) = Color\(0xFF([0-9A-Fa-f]{6})\)', color_src))

domains = []
for m in re.finditer(r'(\w+)\("([^"]+)",\s*"([^"]+)",\s*(\w+),\s*"([^"]+)"\)', models):
    name, did, label, color_key, desc = m.groups()
    domains.append({
        'name': name,
        'id': did,
        'label': label,
        'description': desc,
        'color': '#' + colors.get(color_key, '1D4ED8'),
    })

tiers = []
for m in re.finditer(r'(\w+)\("([^"]+)",\s*(\d+),\s*(\d+),\s*"([^"]+)",\s*(\w+),\s*(\d+)\)', models):
    name, label, pts, courses_req, english, color_key, price = m.groups()
    tiers.append({
        'name': name, 'label': label, 'minPoints': int(pts),
        'minCourses': int(courses_req), 'requiredEnglish': english,
        'color': '#' + colors.get(color_key, 'B45309'),
        'price': int(price),
    })

data['domains'] = domains
data['tiers'] = tiers

# IDs de domaine : on convertit les noms d'énumération en ids courts
name_to_id = {d['name']: d['id'] for d in domains}
for collection in ('courses', 'flashcards', 'badges', 'jobs', 'projects', 'messages'):
    for item in data[collection]:
        if isinstance(item.get('domainId'), str):
            item['domainId'] = name_to_id.get(item['domainId'], item['domainId'])

json.dump(data, open(ROOT / 'web/src/data/seed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('domains:', len(domains), '| tiers:', len(tiers))
print([ (d['id'], d['label'], d['color']) for d in domains ][:4])
