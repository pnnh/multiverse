import {RemoteDomain} from "@/services/server/domain/remote";
import {IDomain} from "@/services/common/domain";
import {useServerConfig} from "@/services/server/config";

function trySigninDomain(domainUrl: string | undefined = ""): IDomain | undefined {
    const systemDomain = new RemoteDomain(domainUrl)
    return systemDomain as IDomain
}

export function serverMustSigninDomain(domainUrl: string | undefined = ''): IDomain {
    const domain = trySigninDomain(domainUrl)
    if (!domain) {
        throw new Error('domain not found')
    }
    return domain
}

export function serverSigninDomain(): IDomain {
    const serverConfig = useServerConfig()
    const domain = trySigninDomain(serverConfig.NEXT_PUBLIC_SELF_URL)
    if (!domain) {
        throw new Error('domain not found')
    }
    return domain
}
