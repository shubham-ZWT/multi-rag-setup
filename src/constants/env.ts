export const allEnvsExist = () => {
  const envs = [
    'PORT',
    'JWT_SECRET',
    'DATABASE_URL',
    'DIRECT_URL',
    'GOOGLE_API_KEY',
    'GROQ_API_KEY',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM',
    'JWT_REFRESH_SECRET',
  ];
  const missingEnvs = envs.filter((env) => !process.env[env]);
  if (missingEnvs.length > 0) {
    console.error(
      `Missing required environment variables: ${missingEnvs.join(', ')}`,
    );
    return false;
  }
  return true;
};
