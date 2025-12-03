export default function CustomScrollbarStyles() {
  return (
    <style>{`
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #d97706 rgba(4, 120, 87, 0.2);
        scroll-behavior: smooth;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(4, 120, 87, 0.2);
        border-radius: 4px;
        margin: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #d97706 0%, #b45309 100%);
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        background-clip: padding-box;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:active {
        background: #f59e0b;
      }
    `}</style>
  );
}
