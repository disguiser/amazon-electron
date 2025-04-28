interface Window {
  electronAPI: {
    send: (channel: string, data?: any) => void;
    on: (channel: string, callback: (data: any) => void) => void;
    invoke: (channel: string, data?: any) => Promise<any>;
    // 根据实际暴露的 API 补充类型
  };
}