const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    </div>
  );
};

export default PageLoader;