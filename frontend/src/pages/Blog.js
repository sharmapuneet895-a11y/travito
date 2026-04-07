import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import BackToTop from '../components/BackToTop';
import { BookOpen, Clock, Tag, Calendar as CalendarIcon, ChevronDown, ChevronUp, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedBlog, setExpandedBlog] = useState(null);

  const categories = ['all', 'Budget Travel', 'Visa Tips', 'Seasonal Travel', 'Tech & Apps', 'Money Tips', 'Destination Guide'];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/blogs`);
        setBlogs(response.data.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = selectedCategory === 'all'
    ? blogs
    : blogs.filter(blog => blog.category === selectedCategory);

  const getCategoryColor = (category) => {
    const colors = {
      'Budget Travel': '#2A9D8F',
      'Visa Tips': '#E25A53',
      'Seasonal Travel': '#4B89AC',
      'Tech & Apps': '#9B59B6',
      'Money Tips': '#F2A900',
      'Destination Guide': '#E74C3C'
    };
    return colors[category] || '#2C3E50';
  };

  const handleExpand = (blog) => {
    setExpandedBlog(expandedBlog?.slug === blog.slug ? null : blog);
  };

  const closeExpanded = () => {
    setExpandedBlog(null);
  };

  return (
    <div className="min-h-screen py-12 px-6" style={{ background: 'linear-gradient(to bottom, #bae6fd 0%, #e0f7fa 10%, #f0f9ff 25%, #f8fafc 40%, #ffffff 60%)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="blog-page-title">
                Travel Tips & Guides
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Expert advice, insider tips, and comprehensive guides to help you plan your perfect trip. Click on any article to read more.
            </p>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: selectedCategory === category ? '#2C3E50' : '#F5F5F5',
                    color: selectedCategory === category ? 'white' : '#2C3E50'
                  }}
                  data-testid={`category-${category.toLowerCase().replace(/ /g, '-')}`}
                >
                  {category === 'all' ? 'All Articles' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-96" data-testid="loading-blogs">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading articles...</p>
              </div>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog, index) => (
                <motion.article
                  key={blog.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleExpand(blog)}
                  data-testid={`blog-card-${index}`}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(blog.category) }}
                    >
                      {blog.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{blog.read_time} min read</span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-primary" />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 text-muted-foreground rounded text-xs"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No articles found in this category.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Expanded Article Modal */}
      <AnimatePresence>
        {expandedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={closeExpanded}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              data-testid="expanded-article"
            >
              {/* Close button */}
              <button
                onClick={closeExpanded}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all z-10"
                data-testid="close-article"
              >
                <X className="w-5 h-5 text-primary" />
              </button>

              {/* Article Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={expandedBlog.image_url}
                  alt={expandedBlog.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3"
                    style={{ backgroundColor: getCategoryColor(expandedBlog.category) }}
                  >
                    {expandedBlog.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {expandedBlog.title}
                  </h2>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6 md:p-8">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(expandedBlog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{expandedBlog.read_time} min read</span>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-lg text-muted-foreground mb-6 font-medium italic">
                  {expandedBlog.excerpt}
                </p>

                {/* Full Content */}
                <div className="prose prose-lg max-w-none">
                  {expandedBlog.content ? (
                    <div className="text-foreground leading-relaxed whitespace-pre-line">
                      {expandedBlog.content}
                    </div>
                  ) : (
                    <div className="text-foreground leading-relaxed space-y-4">
                      <p>
                        {expandedBlog.excerpt}
                      </p>
                      <p>
                        This article covers essential tips and insights about {expandedBlog.category.toLowerCase()}. 
                        Whether you're a first-time traveler or a seasoned explorer, these tips will help you 
                        make the most of your journey.
                      </p>
                      <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Key Takeaways</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Plan ahead and research your destination thoroughly</li>
                        <li>Always have backup copies of important documents</li>
                        <li>Learn a few basic phrases in the local language</li>
                        <li>Stay connected with local apps and services</li>
                        <li>Respect local customs and traditions</li>
                      </ul>
                      <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Final Thoughts</h3>
                      <p>
                        Remember, the best travel experiences come from being prepared while staying open to 
                        unexpected adventures. Use these tips as a starting point, but don't be afraid to 
                        explore and discover your own travel style.
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
                  {expandedBlog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Close Button */}
                <button
                  onClick={closeExpanded}
                  className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <BackToTop />
    </div>
  );
};

export default Blog;
