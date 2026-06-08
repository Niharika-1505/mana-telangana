import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ReportDetailClient from './ReportDetailClient'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data } = await supabase
    .from('reports')
    .select('description, issue_types(name_en, emoji), wards(ward_name_en)')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Report Not Found | మన తెలంగాణ' }

  const issueType = data.issue_types as any
  const ward = data.wards as any

  return {
    title: `${issueType?.emoji ?? '📍'} ${issueType?.name_en ?? 'Issue'} – ${ward?.ward_name_en ?? ''} | మన తెలంగాణ`,
    description: (data.description as string | null) ?? 'Civic issue reported on మన తెలంగాణ',
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <ReportDetailClient id={id} />
}
