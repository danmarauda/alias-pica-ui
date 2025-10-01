import { createResponseProcessor, setCedarState, getCedarState } from 'cedar-os';
import type { CustomStructuredResponseType } from 'cedar-os';

/**
 * Response processor types for UI manipulation
 */

// Change model response type
type ChangeModelResponse = CustomStructuredResponseType<
  'change_model',
  {
    model: string;
  }
>;

// Clear chat response type
type ClearChatResponse = CustomStructuredResponseType<
  'clear_chat',
  Record<string, never>
>;

// Set input response type
type SetInputResponse = CustomStructuredResponseType<
  'set_input',
  {
    text: string;
  }
>;

// Toggle devtools response type
type ToggleDevtoolsResponse = CustomStructuredResponseType<
  'toggle_devtools',
  Record<string, never>
>;

// Show notification response type
type ShowNotificationResponse = CustomStructuredResponseType<
  'show_notification',
  {
    message: string;
    notificationType?: 'success' | 'error' | 'info' | 'warning';
  }
>;

/**
 * Change Model Response Processor
 * Allows Cedar Copilot to change the selected AI model
 */
export const changeModelProcessor = createResponseProcessor<ChangeModelResponse>({
  type: 'change_model',
  execute: (obj, store) => {
    console.log('🔄 Cedar: Changing model to', obj.model);

    // Store the model change in Cedar state for the UI to pick up
    const currentState = (getCedarState('customState') as Record<string, any>) || {};
    setCedarState('customState', {
      ...currentState,
      selectedModel: obj.model,
    });

    // Add a confirmation message
    store.addMessage({
      role: 'assistant',
      content: `Model changed to ${obj.model}`,
      type: 'text',
    });
  },
});

/**
 * Clear Chat Response Processor
 * Allows Cedar Copilot to clear the chat history
 */
export const clearChatProcessor = createResponseProcessor<ClearChatResponse>({
  type: 'clear_chat',
  execute: (_obj, store) => {
    console.log('🗑️ Cedar: Clearing chat');

    // Clear messages
    store.clearMessages();

    // Add a confirmation message
    store.addMessage({
      role: 'assistant',
      content: 'Chat cleared',
      type: 'text',
    });
  },
});

/**
 * Set Input Response Processor
 * Allows Cedar Copilot to set the chat input text
 */
export const setInputProcessor = createResponseProcessor<SetInputResponse>({
  type: 'set_input',
  execute: (obj, store) => {
    console.log('✏️ Cedar: Setting input to', obj.text);
    
    // Set the override input content
    store.setOverrideInputContent(obj.text);
    
    // Add a confirmation message
    store.addMessage({
      role: 'assistant',
      content: `Input set to: "${obj.text}"`,
      type: 'text',
    });
  },
});

/**
 * Toggle Devtools Response Processor
 * Allows Cedar Copilot to toggle the devtools panel
 */
export const toggleDevtoolsProcessor = createResponseProcessor<ToggleDevtoolsResponse>({
  type: 'toggle_devtools',
  execute: (_obj, store) => {
    console.log('🛠️ Cedar: Toggling devtools');

    // Store the toggle action in Cedar state
    const currentState = (getCedarState('customState') as Record<string, any>) || {};
    setCedarState('customState', {
      ...currentState,
      toggleDevtools: (currentState?.toggleDevtools || 0) + 1,
    });

    // Add a confirmation message
    store.addMessage({
      role: 'assistant',
      content: 'Devtools toggled',
      type: 'text',
    });
  },
});

/**
 * Show Notification Response Processor
 * Allows Cedar Copilot to show toast notifications
 */
export const showNotificationProcessor = createResponseProcessor<ShowNotificationResponse>({
  type: 'show_notification',
  execute: (obj, _store) => {
    console.log('🔔 Cedar: Showing notification', obj.message);

    // Store the notification in Cedar state for the UI to pick up
    const currentState = (getCedarState('customState') as Record<string, any>) || {};
    setCedarState('customState', {
      ...currentState,
      notification: {
        message: obj.message,
        type: obj.notificationType || 'info',
        timestamp: Date.now(),
      },
    });
  },
});

/**
 * Export all response processors
 */
export const cedarResponseProcessors = [
  changeModelProcessor,
  clearChatProcessor,
  setInputProcessor,
  toggleDevtoolsProcessor,
  showNotificationProcessor,
];

