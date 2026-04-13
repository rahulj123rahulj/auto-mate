import { CredentialsContainer, CredentialsError, CredentialsList, CredentialsLoading } from "@/features/credentials/components/credentials";
import { credentialsParamsLoader } from "@/features/credentials/server/params-loader";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    searchParams: Promise<SearchParams>
}

const Page = async ({ searchParams }: PageProps) => {
    await requireAuth();
    const params = await credentialsParamsLoader(searchParams);

    prefetchCredentials(params);
    return (
        <CredentialsContainer>
            <HydrateClient>
                <Suspense fallback={<CredentialsLoading />}>
                    <ErrorBoundary fallback={<CredentialsError />}>
                        <CredentialsList />
                    </ErrorBoundary>
                </Suspense>
            </HydrateClient>
        </CredentialsContainer>
    )
}

export default Page