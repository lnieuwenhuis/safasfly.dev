export function extractSessionToken(authorization: string | undefined, xSessionToken: string | undefined): string {
  if (xSessionToken && xSessionToken.trim()) {
    return xSessionToken.trim();
  }

  if (!authorization) {
    return '';
  }

  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  return authorization.trim();
}
