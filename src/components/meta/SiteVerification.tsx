const GoogleVerification = () => {
  const siteVerificationId = 'nKKjpnhW--8f7QArj2n_an37HrsOZNHmbFV0HWXDM04';

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