const WORD_PER_MINUTE = 265;

export const calculateReadingTime = (html: string) : number => {
  const textLength = html.trim().split(/\s+/).length;

  return Math.ceil(textLength / WORD_PER_MINUTE);
}