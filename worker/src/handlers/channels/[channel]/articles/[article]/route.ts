import {Request, Response} from "express";
import {serverConfig} from "@/services/server/config";
import {SystemArticleService} from "@/business/server/content/article";

export async function GET(request: Request, response: Response, {params}: {
    params: { channel: string, article: string }
}) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemArticleService(domainUrl)

    const {channel, article} = params;
    const result = await articleService.getArticle(channel, article)
    if (!result) {
        return response.json({status: 404})
    }
    return response.json(result)
}
