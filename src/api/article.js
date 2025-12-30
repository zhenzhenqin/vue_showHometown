import request from '@/utils/request'

/**
 * 获取文章列表 (分页 + 搜索)
 * @param {Object} params { page, pageSize, title, mood... }
 */
export function getArticleList(params) {
  return request({
    url: '/articles', // 对应你后端的 @GetMapping("/articles")
    method: 'get',
    params
  })
}

/**
 * 获取文章详情
 * @param {Number} id 
 */
export function getArticleDetail(id) {
  return request({
    url: `/articles/${id}`,
    method: 'get'
  })
}

/**
 * 点赞文章
 * @param {Number} id 
 */
export function likeArticle(id) {
  return request({
    url: `/articles/like/${id}`,
    method: 'post'
  })
}

/**
 * 获取评论列表
 * @param {Number} articleId 
 */
export function getArticleComments(articleId) {
  return request({
    url: `/comments/article/${articleId}`,
    method: 'get'
  })
}

/**
 * 发表评论
 * @param {Object} data { articleId, content }
 */
export function addComment(data) {
  return request({
    url: '/comments',
    method: 'post',
    data
  })
}