import axios from 'axios';

export type OauthProviderId = 'github' | 'google';

export interface OauthProvider {
    getUserInfo: (accessToken: string) => Promise<OauthUserInfo>;
}

export interface OauthUserInfo {
    email: string;
    name: string;
}

export const GitHub: OauthProvider = {
    async getUserInfo(accessToken): Promise<OauthUserInfo> {
        // Get user.
        const userResponse = await axios.request<{ email: string; name: string }>({
            method: 'GET',
            url: 'https://api.github.com/user',
            headers: {
                Accept: 'application/vnd.github.v3+json',
                Authorization: `token ${accessToken}`,
            },
        });

        const name = userResponse.data.name || '';
        let email = userResponse.data.email || '';

        // Get private (primary) email if public email is not provided.
        if (!email) {
            const emailResponse = await axios.request<{ email: string; primary: boolean }[]>({
                method: 'GET',
                url: 'https://api.github.com/user/emails',
                headers: {
                    Accept: 'application/vnd.github.v3+json',
                    Authorization: `token ${accessToken}`,
                },
            });
            email = emailResponse.data.find((item) => item.primary)?.email || '';
        }

        return {
            email,
            name,
        };
    },
};

export const Google: OauthProvider = {
    async getUserInfo(accessToken): Promise<OauthUserInfo> {
        // Get user.
        const userResponse = await axios.request<{ email: string; name: string }>({
            method: 'GET',
            url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const name = userResponse.data.name || '';
        const email = userResponse.data.email || '';

        return {
            email,
            name,
        };
    },
};

const providers: Record<OauthProviderId, OauthProvider> = {
    github: GitHub,
    google: Google,
};

export default providers;
