'use client'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useContext } from 'use-context-selector'
import useSWR, { useSWRConfig } from 'swr'
import AppCard from '@/app/components/app/overview/appCard'
import Loading from '@/app/components/base/loading'
import { ToastContext } from '@/app/components/base/toast'
import {
  fetchAppDetail,
  updateAppSiteAccessToken,
  updateAppSiteConfig,
  updateAppSiteStatus,
} from '@/service/apps'
import type { App } from '@/types/app'
import type { UpdateAppSiteCodeResponse } from '@/models/app'
import { asyncRunSafe } from '@/utils'
import { NEED_REFRESH_APP_LIST_KEY } from '@/config'

export type ICardViewProps = {
  appId: string
}

const CardView: FC<ICardViewProps> = ({ appId }) => {
  const detailParams = { url: '/apps', id: appId }
  const { data: response } = useSWR(detailParams, fetchAppDetail)
  const { mutate } = useSWRConfig()
  const { notify } = useContext(ToastContext)
  const { t } = useTranslation()

  if (!response)
    return <Loading />

  const handleError = (err: Error | null) => {
    if (!err) {
      notify({
        type: 'success',
        message: t('common.actionMsg.modifiedSuccessfully'),
      })
      mutate(detailParams)
    }
    else {
      notify({
        type: 'error',
        message: t('common.actionMsg.modificationFailed'),
      })
    }
  }

  const onChangeSiteStatus = async (value: boolean) => {
    const [err] = await asyncRunSafe<App>(
      updateAppSiteStatus({
        url: `/apps/${appId}/site-enable`,
        body: { enable_site: value },
      }) as Promise<App>,
    )
    handleError(err)
  }

  const onChangeApiStatus = async (value: boolean) => {
    const [err] = await asyncRunSafe<App>(
      updateAppSiteStatus({
        url: `/apps/${appId}/api-enable`,
        body: { enable_api: value },
      }) as Promise<App>,
    )
    handleError(err)
  }

  const onSaveSiteConfig = async (params: any) => {
    const [err] = await asyncRunSafe<App>(
      updateAppSiteConfig({
        url: `/apps/${appId}/site`,
        body: params,
      }) as Promise<App>,
    )
    if (!err)
      localStorage.setItem(NEED_REFRESH_APP_LIST_KEY, '1')

    handleError(err)
  }

  const onGenerateCode = async () => {
    const [err] = await asyncRunSafe<UpdateAppSiteCodeResponse>(
      updateAppSiteAccessToken({
        url: `/apps/${appId}/site/access-token-reset`,
      }) as Promise<UpdateAppSiteCodeResponse>,
    )
    handleError(err)
  }

  return (
    <div className="min-w-max grid gap-6 grid-cols-1 xl:grid-cols-2 w-full mb-6">
      <AppCard
        appInfo={response}
        cardType="webapp"
        onChangeStatus={onChangeSiteStatus}
        onGenerateCode={onGenerateCode}
        onSaveSiteConfig={onSaveSiteConfig}
      />
      <AppCard
        cardType="api"
        appInfo={response}
        onChangeStatus={onChangeApiStatus}
      />
    </div>
  )
}

export default CardView
