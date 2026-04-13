"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, { message: "Variable name must start with a letter or underscore and contains only letters, numbers, and underscores" }),
    content: z.string()
        .min(1, { message: "Message content is required" }),
    webhookUrl: z.string().min(1, { message: "Invalid webhook URL" }),
})

export type SlackFormValues = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: SlackFormValues) => void
    defaultValues?: Partial<SlackFormValues>
}

export const SlackDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {}
}: Props) => {
    const form = useForm<SlackFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            content: defaultValues.content || "",
            webhookUrl: defaultValues.webhookUrl || ""
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                content: defaultValues.content || "",
                webhookUrl: defaultValues.webhookUrl || ""
            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "mySlack";


    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false)
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Slack Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the Slack webhook settings for this node.
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
                                        placeholder="mySlack"
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
                            name="webhookUrl"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="webhookUrl">Webhook URL</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="https://hooks.slack.com/services/..."
                                    />
                                    <FieldDescription>
                                        Get this from Slack: Workplace Settings → Workflows → Webhooks
                                    </FieldDescription>
                                    <FieldDescription>
                                        Make sure you have &quot;content&quot; variable.
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="content"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="method">Message Content</FieldLabel>
                                    <Textarea
                                        placeholder={`Summary: {{myGemini.text}}`}
                                        className="min-h-[80px] font-mono text-sm"
                                        {...field}

                                    />
                                    <FieldDescription>
                                        The message to send. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects
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