'use client';

const GoogleAnalytics = () => {
  const googleAnalyticsId = 'G-0T3HY5V5B4';
  const googleAnalyticsSrc = `https://www.googletagmanager.com/gtag/js?id=${ googleAnalyticsId }`;

  return (
    <>
      <script
        async
        src={googleAnalyticsSrc}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ googleAnalyticsId }');
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
