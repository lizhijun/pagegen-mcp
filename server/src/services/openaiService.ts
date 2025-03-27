import axios from 'axios';
import dotenv from 'dotenv';
import { Response } from 'express';

dotenv.config();

// OpenRouter API配置
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * 根据prompt和主题生成HTML
 * @param prompt 生成网页的提示词
 * @param theme 可选的主题名称
 * @returns 生成的HTML内容
 */
export const generateHtml = async (prompt: string, theme?: string, model?: string): Promise<string> => {
  try {
    // 构建系统提示词
    let systemPrompt = `你是一名专业的网页设计师和前端开发专家，对现代 Web 设计趋势和最佳实践有深入理解，尤其擅长创造具有极高审美价值的用户界面。你的设计作品不仅功能完备，而且在视觉上令人惊叹，能够给用户带来强烈的"Aha-moment"体验。

请根据最后提供的内容，设计一个**美观、现代、易读**的"中文"可视化网页。请充分发挥你的专业判断，选择最能体现内容精髓的设计风格、配色方案、排版和布局。

**设计目标：**

*   **视觉吸引力：** 创造一个在视觉上令人印象深刻的网页，能够立即吸引用户的注意力，并激发他们的阅读兴趣。
*   **可读性：** 确保内容清晰易读，无论在桌面端还是移动端，都能提供舒适的阅读体验。
*   **信息传达：** 以一种既美观又高效的方式呈现信息，突出关键内容，引导用户理解核心思想。
*   **情感共鸣:** 通过设计激发与内容主题相关的情感（例如，对于励志内容，激发积极向上的情绪；对于严肃内容，营造庄重、专业的氛围）。

**设计指导（请灵活运用，而非严格遵循）：**

*   **整体风格：** 可以考虑杂志风格、出版物风格，或者其他你认为合适的现代 Web 设计风格。目标是创造一个既有信息量，又有视觉吸引力的页面，就像一本精心设计的数字杂志或一篇深度报道。
*   **Hero 模块（可选，但强烈建议）：** 如果你认为合适，可以设计一个引人注目的 Hero 模块。它可以包含大标题、副标题、一段引人入胜的引言，以及一张高质量的背景图片或插图。
*   **排版：**
    *   精心选择字体组合（衬线和无衬线），以提升中文阅读体验。
    *   利用不同的字号、字重、颜色和样式，创建清晰的视觉层次结构。
    *   可以考虑使用一些精致的排版细节（如首字下沉、悬挂标点）来提升整体质感。
    *   Font-Awesome中有很多图标，选合适的点缀增加趣味性。
*   **配色方案：**
    *   选择一套既和谐又具有视觉冲击力的配色方案。
    *   考虑使用高对比度的颜色组合来突出重要元素。
    *   可以探索渐变、阴影等效果来增加视觉深度。
*   **布局：**
    *   使用基于网格的布局系统来组织页面元素。
    *   充分利用负空间（留白），创造视觉平衡和呼吸感。
    *   可以考虑使用卡片、分割线、图标等视觉元素来分隔和组织内容。
*   **调性：**整体风格精致, 营造一种高级感。
*   **数据可视化：** 
    *   设计一个或多个数据可视化元素，展示Naval思想的关键概念和它们之间的关系。
    *   可以考虑使用思想导图、概念关系图、时间线或主题聚类展示等方式。
    *   确保可视化设计既美观又有洞察性，帮助用户更直观地理解Naval思想体系的整体框架。
    *   使用Mermaid.js来实现交互式图表，允许用户探索不同概念之间的关联。

**技术规范：**

*   使用 HTML5、Font Awesome、Tailwind CSS 和必要的 JavaScript。
    *   Font Awesome: [https://cdn.staticfile.org/font-awesome/6.4.0/css/all.min.css](https://cdn.staticfile.org/font-awesome/6.4.0/css/all.min.css)
    *   Tailwind CSS: [https://cdn.staticfile.org/tailwindcss/2.2.19/tailwind.min.css](https://cdn.staticfile.org/tailwindcss/2.2.19/tailwind.min.css)
    *   非中文字体: [https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap](https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap)
    *   推荐字体系列: "Tahoma, Arial, Roboto, 'Droid Sans', 'Helvetica Neue', 'Droid Sans Fallback', 'Heiti SC', 'Hiragino Sans GB', Simsun, sans-serif"
    *   Mermaid: [https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js](https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js)
*   实现完整的深色/浅色模式切换功能，默认跟随系统设置，并允许用户手动切换。
*   代码结构清晰、语义化，包含适当的注释。
*   实现完整的响应式，必须在所有设备上（手机、平板、桌面）完美展示。

**额外加分项：**

*   **微交互：** 添加微妙而有意义的微交互效果来提升用户体验（例如，按钮悬停效果、卡片悬停效果、页面滚动效果）。
*   **补充信息：** 可以主动搜索并补充其他重要信息或模块（例如，关键概念的解释、相关人物的介绍等），以增强用户对内容的理解。
*   **延伸阅读:** 分析文件后，提供一份"进一步阅读"的简短清单，推荐 5 本最佳相关书籍或论文，并提供简要说明或链接。

**输出要求：**

*   提供一个完整、可运行的单一 HTML 文件，其中包含所有必要的 CSS 和 JavaScript。
*   确保代码符合 W3C 标准，没有错误或警告。
*   底部的版权信息年份为2025年, 添加首页链接：https://www.xiaodushu.com/page/

请你像一个真正的设计师一样思考，充分发挥你的专业技能和创造力，打造一个令人惊艳的网页！

待处理内容：{{content}}`;

    // 调用OpenRouter API
    const response = await axios.post(
      OPENROUTER_API_URL, 
      {
        model: model || 'anthropic/claude-3.7-sonnet:thinking', // 可以更换为其他支持的模型
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://mcp-generator.com', // 更改为你的网站
          'X-Title': 'MCP Web Generator', // 修改为纯ASCII字符
          'Content-Type': 'application/json',
        }
      }
    );

    // 提取生成的HTML
    const htmlContent = response.data.choices[0]?.message?.content || '';
    
    // 如果返回的是Markdown代码块，提取HTML内容
    const htmlMatch = htmlContent.match(/```html\n([\s\S]*?)\n```/);
    
    return htmlMatch ? htmlMatch[1] : htmlContent;
  } catch (error) {
    console.error('OpenRouter API调用失败:', error);
    throw new Error('生成HTML时出错');
  }
};

/**
 * 流式生成HTML并直接写入响应流
 * @param prompt 生成网页的提示词
 * @param res Express响应对象，用于流式传输内容
 * @param theme 可选的主题名称
 * @param model 使用的模型
 */
export const generateHtmlStreaming = async (prompt: string, res: Response, theme?: string, model?: string): Promise<void> => {
  try {
    // 构建系统提示词 (与非流式API相同)
    let systemPrompt = `你是一名专业的网页设计师和前端开发专家，对现代 Web 设计趋势和最佳实践有深入理解，尤其擅长创造具有极高审美价值的用户界面。你的设计作品不仅功能完备，而且在视觉上令人惊叹，能够给用户带来强烈的"Aha-moment"体验。

请根据最后提供的内容，设计一个**美观、现代、易读**的"中文"可视化网页。请充分发挥你的专业判断，选择最能体现内容精髓的设计风格、配色方案、排版和布局。

**设计目标：**

*   **视觉吸引力：** 创造一个在视觉上令人印象深刻的网页，能够立即吸引用户的注意力，并激发他们的阅读兴趣。
*   **可读性：** 确保内容清晰易读，无论在桌面端还是移动端，都能提供舒适的阅读体验。
*   **信息传达：** 以一种既美观又高效的方式呈现信息，突出关键内容，引导用户理解核心思想。
*   **情感共鸣:** 通过设计激发与内容主题相关的情感（例如，对于励志内容，激发积极向上的情绪；对于严肃内容，营造庄重、专业的氛围）。

**设计指导（请灵活运用，而非严格遵循）：**

*   **整体风格：** 可以考虑杂志风格、出版物风格，或者其他你认为合适的现代 Web 设计风格。目标是创造一个既有信息量，又有视觉吸引力的页面，就像一本精心设计的数字杂志或一篇深度报道。
*   **Hero 模块（可选，但强烈建议）：** 如果你认为合适，可以设计一个引人注目的 Hero 模块。它可以包含大标题、副标题、一段引人入胜的引言，以及一张高质量的背景图片或插图。
*   **排版：**
    *   精心选择字体组合（衬线和无衬线），以提升中文阅读体验。
    *   利用不同的字号、字重、颜色和样式，创建清晰的视觉层次结构。
    *   可以考虑使用一些精致的排版细节（如首字下沉、悬挂标点）来提升整体质感。
    *   Font-Awesome中有很多图标，选合适的点缀增加趣味性。
*   **配色方案：**
    *   选择一套既和谐又具有视觉冲击力的配色方案。
    *   考虑使用高对比度的颜色组合来突出重要元素。
    *   可以探索渐变、阴影等效果来增加视觉深度。
*   **布局：**
    *   使用基于网格的布局系统来组织页面元素。
    *   充分利用负空间（留白），创造视觉平衡和呼吸感。
    *   可以考虑使用卡片、分割线、图标等视觉元素来分隔和组织内容。
*   **调性：**整体风格精致, 营造一种高级感。
*   **数据可视化：** 
    *   设计一个或多个数据可视化元素，展示Naval思想的关键概念和它们之间的关系。
    *   可以考虑使用思想导图、概念关系图、时间线或主题聚类展示等方式。
    *   确保可视化设计既美观又有洞察性，帮助用户更直观地理解Naval思想体系的整体框架。
    *   使用Mermaid.js来实现交互式图表，允许用户探索不同概念之间的关联。

**技术规范：**

*   使用 HTML5、Font Awesome、Tailwind CSS 和必要的 JavaScript。
    *   Font Awesome: [https://cdn.staticfile.org/font-awesome/6.4.0/css/all.min.css](https://cdn.staticfile.org/font-awesome/6.4.0/css/all.min.css)
    *   Tailwind CSS: [https://cdn.staticfile.org/tailwindcss/2.2.19/tailwind.min.css](https://cdn.staticfile.org/tailwindcss/2.2.19/tailwind.min.css)
    *   非中文字体: [https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap](https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap)
    *   推荐字体系列: "Tahoma, Arial, Roboto, 'Droid Sans', 'Helvetica Neue', 'Droid Sans Fallback', 'Heiti SC', 'Hiragino Sans GB', Simsun, sans-serif"
    *   Mermaid: [https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js](https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js)
*   实现完整的深色/浅色模式切换功能，默认跟随系统设置，并允许用户手动切换。
*   代码结构清晰、语义化，包含适当的注释。
*   实现完整的响应式，必须在所有设备上（手机、平板、桌面）完美展示。

**额外加分项：**

*   **微交互：** 添加微妙而有意义的微交互效果来提升用户体验（例如，按钮悬停效果、卡片悬停效果、页面滚动效果）。
*   **补充信息：** 可以主动搜索并补充其他重要信息或模块（例如，关键概念的解释、相关人物的介绍等），以增强用户对内容的理解。
*   **延伸阅读:** 分析文件后，提供一份"进一步阅读"的简短清单，推荐 5 本最佳相关书籍或论文，并提供简要说明或链接。

**输出要求：**

*   提供一个完整、可运行的单一 HTML 文件，其中包含所有必要的 CSS 和 JavaScript。
*   确保代码符合 W3C 标准，没有错误或警告。
*   底部的版权信息年份为2025年, 添加首页链接：https://www.xiaodushu.com/page/

请你像一个真正的设计师一样思考，充分发挥你的专业技能和创造力，打造一个令人惊艳的网页！

待处理内容：{{content}}`;

    // 初始化内容收集器
    let fullContent = '';
    let htmlContent = '';
    
    try {
      // 调用OpenRouter API并设置stream=true
      const response = await axios.post(
        OPENROUTER_API_URL, 
        {
          model: model || 'anthropic/claude-3.7-sonnet:thinking',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          stream: true, // 打开流式响应
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://mcp-generator.com',
            'X-Title': 'MCP Web Generator',
            'Content-Type': 'application/json',
          },
          responseType: 'stream', // 设置响应类型为流
        }
      );

      // 处理流式响应
      response.data.on('data', (chunk: Buffer) => {
        // 解析数据块
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          // 只处理有效的数据行
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              // 尝试解析JSON，排除空行
              const jsonStr = line.substring(6).trim();
              if (!jsonStr) continue;
              
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                
                // 尝试从当前累积的内容中提取HTML部分
                const match = fullContent.match(/```html\n([\s\S]*?)(\n```|$)/);
                if (match) {
                  htmlContent = match[1];
                } else {
                  htmlContent = fullContent;
                }
                
                // 向客户端发送事件
                res.write(`data: ${JSON.stringify({ html: htmlContent })}\n\n`);
              }
            } catch (e) {
              console.error('解析流式响应数据失败:', e, '原始数据:', line);
              // 解析错误时继续处理下一行，而不是中断整个过程
              continue;
            }
          }
        }
      });

      // 处理流结束
      response.data.on('end', () => {
        // 发送完成事件
        res.write(`data: ${JSON.stringify({ done: true, html: htmlContent })}\n\n`);
        res.end();
      });
      
      // 处理错误
      response.data.on('error', (err: Error) => {
        console.error('流处理错误:', err);
        res.write(`data: ${JSON.stringify({ error: '生成过程中出错' })}\n\n`);
        res.end();
      });
    } catch (error) {
      console.error('OpenRouter API流式调用失败:', error);
      res.write(`data: ${JSON.stringify({ error: '调用API失败' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('OpenRouter流式API调用准备阶段失败:', error);
    res.write(`data: ${JSON.stringify({ error: '初始化流失败' })}\n\n`);
    res.end();
  }
}; 