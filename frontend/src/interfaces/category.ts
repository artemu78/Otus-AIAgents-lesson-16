import type { Tables } from '../../database.types'

export interface Category extends Pick<Tables<'category'>, 'id' | 'name'> {}
