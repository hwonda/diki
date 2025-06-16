const GoogleVerification = () => {
  const siteVerificationId = 'ZrRqbDQ_hD1sYIWulMtDDszH4eakdZ2x68H-h2d11HI';

  return(
    <>
      <meta
        name="google-site-verification"
        content={siteVerificationId}
      />
      {/* <meta
        name="naver-site-verification"
        content=""
      /> */}
    </>
  );
};

export default GoogleVerification;