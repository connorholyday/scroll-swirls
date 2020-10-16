import React, { lazy, Suspense, useEffect, useState } from 'react';

const Swirls = lazy(() => import('./swirls'));

function App() {
  const [hasMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className='main'>
      {hasMounted && (
        <Suspense fallback={null}>
          <Swirls />
        </Suspense>
      )}
    </main>
  );
}

export default App;
