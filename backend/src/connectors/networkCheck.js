import net from 'net';

export function checkTcpConnectivity({ host, port, timeoutMs = 3000 }) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    function closeAndResolve(ok, message) {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, message });
    }

    socket.setTimeout(timeoutMs);
    socket.on('connect', () => closeAndResolve(true, 'Conexión TCP exitosa'));
    socket.on('timeout', () => closeAndResolve(false, `Timeout tras ${timeoutMs}ms`));
    socket.on('error', (err) => closeAndResolve(false, err.message));

    socket.connect(port, host);
  });
}
