import {
  Avatar,
  Box,
  Container,
  Title,
  Text,
  Timeline,
  Divider,
  ActionIcon,
  Button,
  List,
} from '@mantine/core';
import { EmotionSx } from '@mantine/emotion';
import {
  IconSchool,
  IconBriefcase,
  IconBulb,
  IconId,
  IconStar,
  IconPhone,
  IconMail,
  IconBrandLinkedin,
  IconBrandGithub,
} from '@tabler/icons';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { allResumes } from '@wrthwhl/content';
import Obfuscate from 'react-obfuscate';
import { CSSProperties, useEffect, useState, ReactNode } from 'react';

// Client-only wrapper to prevent hydration mismatch with react-obfuscate
const ClientOnly = ({ children }: { children: ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) return null;
  return <>{children}</>;
};

// Wrapper for Obfuscate to prevent hydration errors
const SafeObfuscate = (props: React.ComponentProps<typeof Obfuscate>) => (
  <ClientOnly>
    <Obfuscate {...props} />
  </ClientOnly>
);

const Golden = ({
  children,
  style,
  ...rest
}: {
  children: JSX.Element | JSX.Element[];
  style?: CSSProperties;
}) => {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyItems: 'center',
        flexGrow: 1,
        width: '100%',
        height: '100%',
        ...style,
      }}
      {...rest}
    >
      <Box style={{ flex: '1 1 38.2%' }} />
      <Box
        style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
        }}
      >
        <Box style={{ flex: '1 1 38.2%' }} />
        <Container
          style={{
            flex: '0 0 auto',
            maxWidth: '80ch',
          }}
        >
          {children}
        </Container>
        <Box style={{ flex: '1 1 61.8%' }} />
      </Box>
      <Box style={{ flex: '1 1 61.8%' }} />
    </Box>
  );
};

// Import fib function from theme for use in components
import { fib } from '../theme';

const mdxComponents = {
  Avatar,
  Section: ({
    children,
    mx,
    my,
  }: {
    children: React.ReactNode;
    mx?: number;
    my?: number;
  }) => (
    <Box
      style={{
        margin: `${fib(my || 3, 'em')} ${fib(mx || 0, 'em')}`,
      }}
    >
      {children}
    </Box>
  ),
  Title,
  Text,
  TimelineItem: ({
    children,
    title,
    org,
    startYear,
    endYear,
    sx,
  }: {
    children: React.ReactNode;
    title: string;
    org: string;
    startYear: string;
    endYear?: string;
    sx?: EmotionSx;
  }) => (
    <Box
      sx={sx}
      style={{
        display: 'flex',
        flexDirection: 'row',
        margin: `${fib(1, 'em')} ${fib(1, 'em')}`,
        breakInside: 'avoid',
      }}
    >
      <Box
        style={{
          marginRight: fib(1, 'em'),
          fontFamily: 'var(--mantine-font-family-monospace)',
        }}
      >
        <Box
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'center',
          }}
        >
          <Text c="dimmed" inherit>
            {endYear || 'Now'}
          </Text>
          <Box
            style={{
              width: '50%',
              height: '100%',
              borderRight: 'solid 1px var(--mantine-color-gray-8)',
            }}
          />
          <Text c="dimmed" inherit>
            {startYear}
          </Text>
        </Box>
      </Box>
      <Box>
        <Text
          size="sm"
          fw="bold"
          style={{
            cursor: 'default',
          }}
        >
          {title}{' '}
          <Text size="sm" c="dimmed" component="span">
            @ {org}
          </Text>
        </Text>
        <Box
          style={{
            fontSize: 'var(--mantine-font-size-sm)',
            lineHeight: 'var(--mantine-line-height-sm)',
            color: 'var(--mantine-color-gray-4)',
            marginBottom: fib(-3, 'em'),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  ),
  Divider: ({ ...props }) => (
    <Divider style={{ margin: `${fib(1, 'em')} 0` }} {...props} />
  ),
  Timeline,
  IconBriefcase,
  IconBulb,
  IconSchool,
  IconId,
  IconStar,
  IconPhone,
  IconMail,
  IconBrandLinkedin,
  IconBrandGithub,
  List,
  Obfuscate: SafeObfuscate,
  ActionIcon,
  Box,
};

export function Index({ doc }: { doc: { body: { code: string } } }) {
  const MdxContent = useMDXComponent(doc.body.code);
  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <Golden>
      <Box
        style={{
          maxWidth: '80ch',
          margin: `${fib(1, 'em')} auto 0`,
          paddingBottom: fib(1, 'em'),
          position: 'relative',
        }}
      >
        <Button
          variant="outline"
          onClick={handlePrint}
          styles={{
            root: {
              margin: '1em auto',
              display: 'block',
              position: 'absolute',
              right: 0,
            },
          }}
          className="no-print"
        >
          Print
        </Button>
        <MdxContent components={mdxComponents} />
      </Box>
    </Golden>
  );
}

export const getStaticPaths = () => {
  // Generate paths for each resume
  const paths = allResumes.map((resume) => ({
    params: { slug: [resume.slug] },
  }));

  // Add root path (/) which uses the first/default resume
  paths.push({ params: { slug: [] } });

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

  // Find the matching resume, or default to first one for root path
  const doc = allResumes.find((r) => r.slug === slug) || allResumes[0];

  return {
    props: { doc },
  };
};

export default Index;
