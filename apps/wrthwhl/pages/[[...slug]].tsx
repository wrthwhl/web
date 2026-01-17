import { useMDXComponent } from 'next-contentlayer2/hooks';
import { allResumes, Resume } from '@wrthwhl/content';
import { GoldenPageLayout } from '../components/ui/GoldenPageLayout';
import {
  ResumeContext,
  Header,
  Summary,
  Section,
  Timeline,
  SkillGroup,
  Skill,
  Skills,
  Contact,
} from '../components/resume';

// MDX component mapping - only semantic components exposed
const mdxComponents = {
  Summary,
  Section,
  Job: Timeline.Item,
  Training: Timeline.Item,
  SkillGroup,
  Skill,
  Skills,
  Contact,
};

export function Index({ doc }: { doc: Resume }) {
  const MdxContent = useMDXComponent(doc.body.code);

  return (
    <ResumeContext.Provider value={doc}>
      <GoldenPageLayout>
        <div className="max-w-[80ch] mx-auto pb-[1.618em]">
          <Header />
          <div className="px-4">
            <MdxContent components={mdxComponents} />
          </div>
        </div>
      </GoldenPageLayout>
    </ResumeContext.Provider>
  );
}

export const getStaticPaths = () => {
  const isDev = process.env.NODE_ENV === 'development';

  // In production, only serve the root path (/)
  // In dev, also serve individual resume slugs for testing
  const paths: { params: { slug: string[] } }[] = [{ params: { slug: [] } }];

  if (isDev) {
    allResumes.forEach((resume) => {
      paths.push({ params: { slug: [resume.slug] } });
    });
  }

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params?: { slug?: string[] };
}) => {
  const slug = params?.slug?.[0] || 'resume';
  const doc = allResumes.find((r) => r.slug === slug) || allResumes[0];

  return {
    props: { doc },
  };
};

export default Index;
