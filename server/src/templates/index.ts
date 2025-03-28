// 导入所有模板
import { standardTemplate } from './standard';
import { minimalTemplate } from './minimal';
import { creativeTemplate } from './creative';

// 模板元数据类型定义
export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  template: string;
}

// 定义可用的模板列表
export const templates: Record<string, TemplateInfo> = {
  standard: {
    id: 'standard',
    name: '标准模板',
    description: '专业美观的网页设计，包含完整的视觉元素和功能',
    template: standardTemplate
  },
  minimal: {
    id: 'minimal',
    name: '极简模板',
    description: '遵循"少即是多"的设计哲学，专注于内容本身',
    template: minimalTemplate
  },
  creative: {
    id: 'creative',
    name: '创意模板',
    description: '大胆前卫的设计风格，将网页变成一件艺术品',
    template: creativeTemplate
  }
};

// 获取默认模板
export const getDefaultTemplate = (): string => {
  return standardTemplate;
};

// 根据模板ID获取模板内容
export const getTemplateById = (id?: string): string => {
  if (!id || !templates[id]) {
    return getDefaultTemplate();
  }
  return templates[id].template;
};

// 获取所有模板信息（不包含模板内容）
export const getAllTemplatesInfo = (): Omit<TemplateInfo, 'template'>[] => {
  return Object.values(templates).map(({ id, name, description }) => ({
    id,
    name,
    description
  }));
}; 