import { defineDocumentType, makeSource } from 'contentlayer/source-files';

export const Resume = defineDocumentType(() => ({
  name: 'Resume',
  filePathPattern: `**/*.mdx`,
  contentType: 'mdx',
  isSingleton: false,
  fields: {
    lastEditedAt: {
      type: 'date',
      description: 'The date of the last edit',
      required: true,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ''),
    },
  },
}));

export default makeSource({
  disableImportAliasWarning: true,
  contentDirPath: 'libs/content/src',
  documentTypes: [Resume],
  mdx: { rehypePlugins: [], remarkPlugins: [] },
});
