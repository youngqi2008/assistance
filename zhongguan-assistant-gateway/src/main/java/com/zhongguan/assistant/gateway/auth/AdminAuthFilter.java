package com.zhongguan.assistant.gateway.auth;

import com.zhongguan.assistant.gateway.config.ZhongguanProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class AdminAuthFilter extends OncePerRequestFilter {

    private final ZhongguanProperties properties;

    public AdminAuthFilter(ZhongguanProperties properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/admin/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String adminToken = properties.adminToken();
        if (adminToken == null || adminToken.isBlank()) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            write(response, "ZG50301", "未配置 ZHONGUAN_ADMIN_TOKEN，管理接口未开放");
            return;
        }
        String provided = request.getHeader("X-Admin-Token");
        if (provided == null || !adminToken.equals(provided)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            write(response, "ZG40101", "管理令牌无效");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private static void write(HttpServletResponse response, String errCode, String message) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"success\":false,\"errCode\":\"" + errCode + "\",\"message\":\"" + message + "\"}");
    }
}
