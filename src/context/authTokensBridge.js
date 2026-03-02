let updateTokensCallback = null;

export const registerUpdateTokens = (fn) => {
  updateTokensCallback = fn;
};

export const notifyTokensUpdated = (accessToken, refreshToken) => {
  if (typeof updateTokensCallback === 'function') {
    try {
      updateTokensCallback(accessToken, refreshToken);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error notificando actualización de tokens:', error);
    }
  }
};

