/**
 * Extracts the client IP address from the request
 * Handles X-Forwarded-For header from proxies and IPv6-mapped IPv4 addresses
 */
exports.getClientIp = (req) => {
  // Try X-Forwarded-For header first (from proxies)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    let ip = forwarded.split(",")[0].trim();
    // Remove IPv6 prefix if present
    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }
    return ip;
  }

  // Try socket.remoteAddress (Node.js 16+)
  if (req.socket && req.socket.remoteAddress) {
    let ip = req.socket.remoteAddress;
    // Convert IPv6 loopback to IPv4 loopback for consistency
    if (ip === "::1") {
      return "127.0.0.1";
    }
    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }
    return ip;
  }

  // Fallback to connection.remoteAddress (older Node.js versions)
  if (req.connection && req.connection.remoteAddress) {
    let ip = req.connection.remoteAddress;
    // Convert IPv6 loopback to IPv4 loopback for consistency
    if (ip === "::1") {
      return "127.0.0.1";
    }
    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }
    return ip;
  }

  // Last resort - return Unknown
  return "Unknown";
};
