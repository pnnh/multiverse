import './page.scss'
import React from 'react'
import {TocInfo} from '@/components/common/toc'
import {formatRfc3339} from '@pnnh/atom'
import {Metadata} from 'next'
import {generatorRandomString} from "@pnnh/atom";
import {channelName, PSArticleModel} from "@pnnh/polaris-business";
import {TocItem} from "@pnnh/stele";
import {serverSigninDomain} from "@/services/server/domain/domain";
import {ArticleAssets} from "@/app/content/channels/[channel]/articles/[article]/assets";
import {pageTitle} from "@/utils/page";
import Image from "next/image";
import ContentLayout, {templateBodyId} from '@/components/server/content/layout'
import {HtmlLayout} from '@/components/server/layout'
import {ArticleContainer} from "@/components/client/article";
import {getPathname} from "@/services/server/pathname";
import {GoTop} from "@/components/client/gotop";
import {headers} from "next/headers";
import {CiAlarmOn} from "react-icons/ci";
import {FaEye} from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function Home({params, searchParams}: {
    params: { channel: string, article: string },
    searchParams: Record<string, string>
}) {
    const metadata: Metadata = {}
    const domain = serverSigninDomain()
    const url = `/channels/${params.channel}/articles/${params.article}`
    const model = await domain.makeGet<PSArticleModel | undefined>(url)

    if (model == null) {
        return <div>遇到错误</div>
    }
    metadata.title = pageTitle(model.title)

    metadata.description = model.description
    metadata.keywords = model.keywords

    const article = model
    const tocList: TocItem[] = []
    const titleId = generatorRandomString(8)
    tocList.push({title: article.title, header: 0, id: titleId})
    if (!article.body) {
        return <div>暂不支持的文章类型</div>
    }
    const headersList = headers()
    const clientIp = headersList.get('x-ip') || 'unknown'
    // 更新文章阅读次数
    if (clientIp) {
        await domain.makePost(`/articles/${params.article}/viewer`, {clientIp})
    }
    const readUrl = `/content/channels/${params.channel}/articles/${params.article}`
    const assetsUrl = domain.assetUrl(`/channels/${params.channel}/articles/${params.article}/assets`)
    let imageUrl = '/images/default/cover.png'
    if (model.cover) {
        imageUrl = domain.assetUrl(`/channels/${model.channel}/articles/${model.urn}/assets/${model.cover}`)
    }
    const pathname = getPathname()
    return <HtmlLayout metadata={metadata}>
        <ContentLayout searchParams={searchParams} pathname={pathname}>
            <div>
                <div className={'articleCover'}>
                    <Image className={'coverImage'} src={imageUrl} alt={'cover'} fill={true}/>
                </div>
                <div className={'articleContainer'}>
                    <div className={'leftArea'} id={'articleReadBody'}>
                        <div className={'articleHeader'}>
                            <h1 className={'articleTitle'} id={titleId}>{article.title}</h1>
                            <div className={'articleDescription'}>
                                {article.description}
                            </div>
                            <div className={'action'}>
                                <FaEye size={'1rem'}/><span>{article.discover}</span>&nbsp;
                                <CiAlarmOn size={'1rem'}/><span>{formatRfc3339(article.update_time)}</span>
                            </div>
                        </div>
                        <div className={'articleInfo'}>
                            <div className={'articleBody'}>
                                <ArticleContainer tocList={tocList} header={article.header} body={article.body}
                                                  assetsUrl={assetsUrl}/>
                            </div>
                        </div>
                    </div>
                    <div className={'rightArea'}>
                        <TocInfo readurl={readUrl} model={tocList}/>
                        <ArticleAssets channelUrn={params.channel} articleUrn={params.article}/>
                    </div>
                </div>
                <GoTop anchor={templateBodyId}/>
            </div>
        </ContentLayout>
    </HtmlLayout>
}