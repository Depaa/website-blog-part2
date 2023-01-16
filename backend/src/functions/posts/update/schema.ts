export default {
  type: 'object',
  required: [
    'title',
    'content',
    'contentPreview',
    'imagePreview'
  ],
  properties: {
    title: {
      type: 'string'
    },
    content: {
      type: 'string'
    },
    contentPreview: {
      type: 'string'
    },
    imagePreview: {
      type: 'string'
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      },
      minItems: 0,
      maxItems: 5,
      uniqueItems: true,
      default: []
    }
  }
} as const;
