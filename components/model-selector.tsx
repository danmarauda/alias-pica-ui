"use client"

import GradientButton from "./gradient-button"

const models = [
    { id: "gpt-4.1", name: "GPT-4.1", variant: "emerald" as const },
    { id: "gpt-5", name: "GPT-5", variant: "purple" as const },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", variant: "orange" as const },
    { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", variant: "emerald" as const },
]

interface ModelSelectorProps {
    selectedModel: string
    onModelChange: (model: string) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
    return (
        <div className="flex gap-2 flex-wrap mt-2">
            {models.map((model) => (
                <GradientButton
                    key={model.id}
                    label={model.name}
                    variant={model.variant}
                    onClick={() => onModelChange(model.id)}
                    className={`${
                        model.id === selectedModel
                            ? 'ring-2 ring-green-500/50'
                            : 'opacity-70 hover:opacity-100'
                    }`}
                />
            ))}
        </div>
    )
}
