const GoogleVerification = () => {
  const siteVerificationId = 'ZrRqbDQ_hD1sYIWulMtDDszH4eakdZ2x68H-h2d11HI';

  return(
    <>
      <meta
        name="google-site-verification"
        content={siteVerificationId}
      />
      <meta
        name="naver-site-verification"
        content="4f2d5a06c90b5260ce153023faef37a2b617c431"
      />
    </>
  );
};

export default GoogleVerification;