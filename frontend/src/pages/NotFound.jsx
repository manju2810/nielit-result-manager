const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page Not Found</p>
        <a href="/login" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default NotFound;