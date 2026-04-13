"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AVAILABLE_ANTHROPIC_MODELS, DEFAULT_ANTHROPIC_MODEL } from "@/config/constants"
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials"
import { CredentialType } from "@/generated/prisma/enums"
import { zodResolver } from "@hookform/resolvers/zod"
import { Image } from "node_modules/@base-ui/react/esm/avatar/index.parts"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, { message: "Variable name must start with a letter or underscore and contains only letters, numbers, and underscores" }),
    credentialId: z.string().min(1, { message: "Credential is required" }),
    model: z.enum(AVAILABLE_ANTHROPIC_MODELS),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, { message: "User prompt is required" }),
})

export type AnthropicFormValues = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: AnthropicFormValues) => void
    defaultValues?: Partial<AnthropicFormValues>
}

export const AnthhropicDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {}
}: Props) => {
    const {
        data: credentials,
        isLoading: isLoadingCredentials
    } = useCredentialsByType(CredentialType.ANTHROPIC);
    const form = useForm<AnthropicFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId || "",
            model: defaultValues.model || DEFAULT_ANTHROPIC_MODEL,
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || ""
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                credentialId: defaultValues.credentialId || "",
                model: defaultValues.model || DEFAULT_ANTHROPIC_MODEL,
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || ""
            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "myAnthropicResponse";


    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false)
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Anthropic Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the AI model and prompts for this node.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-8 mt-4">
                    <FieldGroup>
                        <Controller
                            name="variableName"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="method">Variable Name</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="myAnthropicResponse"
                                    />
                                    <FieldDescription>
                                        Use this name to reference the result in other nodes:{" "}
                                        {`{{${watchVariableName}.text}}`}
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="credentialId"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="type">Anthropic Credential</FieldLabel>
                                    <Select name={field.name} value={field.value} disabled={
                                        isLoadingCredentials ||
                                        credentials?.length === 0
                                    } onValueChange={field.onChange}>
                                        <SelectTrigger id="type" className="w-full" aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select a credential" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                credentials?.map(({ id, name }) => (
                                                    <SelectItem key={id} value={id}>
                                                        <div className="flex items-center gap-2">
                                                            <Image src="/logos/anthropic.svg" width={16} height={16} alt="Anthropic" />
                                                            {name}
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="model"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="model">Model</FieldLabel>
                                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id="method" aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {
                                                AVAILABLE_ANTHROPIC_MODELS.map((model) => (
                                                    <SelectItem key={model} value={model}>{model}</SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        The Anthropic model to use for completion.
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="systemPrompt"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="method">System Prompt (Optional)</FieldLabel>
                                    <Textarea
                                        placeholder={`You are a helpful assistant.`}
                                        className="min-h-[80px] font-mono text-sm"
                                        {...field}

                                    />
                                    <FieldDescription>
                                        Sets the behaviour of the assistant. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="userPrompt"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="method">User Prompt </FieldLabel>
                                    <Textarea
                                        placeholder={`Summarize this text: {{json httpResponse.data}}`}
                                        className="min-h-[120px] font-mono text-sm"
                                        {...field}

                                    />
                                    <FieldDescription>
                                        The prompt to send to the AI. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <DialogFooter className="mt-4">
                        <Button type="submit">Save</Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    )
}