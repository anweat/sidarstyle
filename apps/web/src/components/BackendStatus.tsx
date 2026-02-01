import { useState, useEffect } from 'react';
import { checkBackendHealth } from '../utils/healthCheck';

export function BackendStatus() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    let intervalId: number;

    const check = async () => {
      const healthy = await checkBackendHealth();
      if (mounted) {
        setIsHealthy(healthy);
        setChecking(false);
      }
    };

    check();
    
    // Check every 10 seconds
    intervalId = window.setInterval(check, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (checking) {
    return null; // Don't show anything while initial check
  }

  if (isHealthy) {
    return null; // Don't show anything if backend is healthy
  }

  return (
    <div style={{
      background: '#e74c3c',
      color: 'white',
      padding: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
    }}>
      注意：后端 API 无响应，请确保 API 服务正在 3001 端口运行。
      <br />
      <small>运行：<code>cd apps/api && npm run dev</code></small>
    </div>
  );
}


