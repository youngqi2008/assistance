package com.zhongguan.assistant.gateway.auth;

import com.zhongguan.assistant.gateway.client.ClientRecord;
import com.zhongguan.assistant.gateway.client.ClientRegistry;
import com.zhongguan.assistant.gateway.config.ZhongguanProperties;
import com.zhongguan.assistant.gateway.crypto.OpenBodySig;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class ClientAuthFilter extends OncePerRequestFilter {

    public static final String CLIENT_ATTR = "zhongguan.client";

    private final ZhongguanProperties properties;
    private final ClientRegistry clientRegistry;

    public ClientAuthFilter(ZhongguanProperties properties, ClientRegistry clientRegistry) {
        this.properties = properties;
        this.clientRegistry = clientRegistry;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!properties.authEnabled()) {
            return true;
        }
        String path = request.getRequestURI();
        return path.startsWith("/actuator") || path.startsWith("/error") || path.startsWith("/admin/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        CachedBodyRequest wrapped = request instanceof CachedBodyRequest cached
                ? cached
                : new CachedBodyRequest(request);
        String body = HttpMethod.POST.matches(wrapped.getMethod()) ? wrapped.bodyAsString() : "";
        OpenBodySig.ParsedHeader header = OpenBodySig.parse(wrapped.getHeader("Authorization"));
        if (header == null || !OpenBodySig.ZHONGUAN_SCHEME.equals(header.scheme())) {
            unauthorized(response, "缺少或无法解析 ZG-BODY-SIG");
            return;
        }
        Optional<ClientRecord> client = clientRegistry.findEnabled(header.appId());
        if (client.isEmpty() || !OpenBodySig.matches(header, client.get().appKey(), body)) {
            unauthorized(response, "调用方鉴权失败");
            return;
        }
        ClientRecord record = client.get();
        wrapped.setAttribute(CLIENT_ATTR, new ZhongguanProperties.Client(record.appId(), record.appKey(), record.userNo()));
        filterChain.doFilter(wrapped, response);
    }

    private static void unauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"success\":false,\"errCode\":\"ZG40100\",\"message\":\"" + message + "\"}");
    }
}
