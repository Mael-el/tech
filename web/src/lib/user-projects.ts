/** Constantes et helpers du suivi de candidatures et des projets personnels. */
import type { ApplicationStatus, ProjectStage } from '../store'

export const APPLICATION_STATUSES: ApplicationStatus[] = ['À postuler', 'Envoyée', 'Entretien', 'Offre', 'Refus']

export const PROJECT_STAGES: ProjectStage[] = ['idée', 'en cours', 'terminé']

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  idée: 'Idée',
  'en cours': 'En cours',
  terminé: 'Terminé',
}

export const JOB_BOARDS = [
  {
    name: 'Novojob',
    url: 'https://www.novojob.com/benin/',
    region: 'Bénin · Côte d’Ivoire · Sénégal · Togo',
    description: 'Offres locales vérifiées, candidature en ligne et alertes e-mail.',
  },
  {
    name: 'Zindi Jobs',
    url: 'https://zindi.world/jobs',
    region: 'Afrique · remote',
    description: 'Postes en data science, IA et ingénierie publiés par des entreprises africaines.',
  },
  {
    name: 'Jobberman',
    url: 'https://www.jobberman.com/',
    region: 'Nigeria · Ghana',
    description: 'Grand portail d’emploi d’Afrique de l’Ouest, filtres par secteur et télétravail.',
  },
  {
    name: 'BrighterMonday',
    url: 'https://www.brightermonday.co.ke/',
    region: 'Kenya · Ouganda · Tanzanie',
    description: 'Offres tech, finance et ONG en Afrique de l’Est.',
  },
  {
    name: 'ReliefWeb',
    url: 'https://reliefweb.int/jobs',
    region: 'International · ONG',
    description: 'Postes humanitaires et développement, souvent basés en Afrique de l’Ouest.',
  },
]
