export function userMessage(cause: unknown, fallback = 'تعذر تنفيذ العملية؛ أعد المحاولة') {
  return cause instanceof Error &&
    /[\u0600-\u06ff]/.test(cause.message) &&
    !cause.message.trim().startsWith('[')
    ? cause.message
    : fallback;
}
