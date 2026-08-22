export interface OpenChatOptions {
  starter?: string;
}

export const CHAT_OPEN_EVENT = 'chat:open';

export function openChat(options: OpenChatOptions = {}): void {
  window.dispatchEvent(new CustomEvent(CHAT_OPEN_EVENT, { detail: options }));
}

export function isChatOpenEvent(event: Event): event is CustomEvent<OpenChatOptions> {
  return event instanceof CustomEvent && event.type === CHAT_OPEN_EVENT;
}