"use client"
import { formatDistanceToNow } from "date-fns";
import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useRouter } from "next/navigation";
import { useEntitySearch } from "../hooks/use-entity-search";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import Image from "next/image";
import { CredentialType } from "@/generated/prisma/enums";
import { Credential } from "@/generated/prisma/client";

const credentialLogos: Record<CredentialType, string> = {
    [CredentialType.OPENAI]: "/logos/openai.svg",
    [CredentialType.GEMINI]: "/logos/gemini.svg",
    [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",    
}

export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialsParams();
    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams, debounceMs: 500 });
    return (
        <>
            <EntitySearch
                value={searchValue}
                onChange={onSearchChange}
                placeholder="Search credentials"
            />
        </>
    )
}
export const CredentialsList = () => {
    const credentials = useSuspenseCredentials();

    return (
        <EntityList
            items={credentials.data?.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <CredentialItem data={credential} />}
            emptyView={<CredentialsEmpty />}
        />
    )
}

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
    return (
        <EntityHeader
            title="Credentials"
            description="Create and manage your credentials"
            newButtonHref={"/credentials/new"}
            newButtonLabel="New Credential"
            disabled={disabled}
        />
    )
};

export const CredentialsPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams();

    return (
        <EntityPagination
            disabled={credentials.isPending}
            page={credentials.data?.page}
            totalPages={credentials.data?.totalPages}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const CredentialsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<CredentialsHeader />}
            search={<CredentialsSearch />}
            pagination={<CredentialsPagination />}
        >
            {children}
        </EntityContainer>
    )
}


export const CredentialsLoading = () => {
    return <LoadingView message="Loading credentials..." />
}

export const CredentialsError = () => {
    return <ErrorView message="Error loading credentials" />
}

export const CredentialsEmpty = () => {
    const router = useRouter();
    const handleCreate = () => {
        router.push(`/credentials/new`);
    }
    return (
        <EmptyView
            message="No credentials found. Get started by creating a credential"
            onNew={handleCreate}
        />
    )
}


export const CredentialItem = ({
    data
}: { data: Credential }) => {
    const removeCredential = useRemoveCredential();

    const logo = credentialLogos[data.type] || "/logos/openai.svg";

    const handleRemove = () => {
        removeCredential.mutate({ id: data.id }, {
            onSuccess: () => { },
            onError: () => { }
        });
    }
    return (
        <EntityItem
            href={`/credentials/${data.id}`}
            title={data.name}
            subtitle={<>
                Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
                &bull; Created{" "}
                {formatDistanceToNow(data.createdAt, { addSuffix: true })}
            </>}
            image={
                <div className="size-8 flex items-center justify-center">
                    <Image 
                        src={logo} 
                        alt={data.type}
                        width={20}
                        height={20}
                     />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />
    )
}