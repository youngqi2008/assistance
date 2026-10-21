package com.zhongguan.assistant.gateway.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zhongguan.assistant.gateway.config.ZhongguanProperties;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ClientRegistry {

    private static final Logger log = LoggerFactory.getLogger(ClientRegistry.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ZhongguanProperties properties;
    private final ObjectMapper fileMapper;
    private final Map<String, ClientRecord> clients = new ConcurrentHashMap<>();

    public ClientRegistry(ZhongguanProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.fileMapper = objectMapper.copy()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @PostConstruct
    void load() {
        for (ZhongguanProperties.Client seed : properties.clients()) {
            if (seed.appId() == null || seed.appId().isBlank()) {
                continue;
            }
            clients.put(seed.appId(), new ClientRecord(
                    seed.appId(),
                    seed.appKey(),
                    seed.appId(),
                    seed.userNo(),
                    true,
                    Instant.EPOCH
            ));
        }
        Path file = clientsFile();
        if (Files.exists(file)) {
            try {
                List<ClientRecord> stored = fileMapper.readValue(file.toFile(), new TypeReference<>() {
                });
                for (ClientRecord record : stored) {
                    clients.put(record.appId(), record);
                }
                log.info("已加载客户凭据文件 {} 条={}", file.toAbsolutePath(), stored.size());
            } catch (IOException e) {
                throw new IllegalStateException("无法读取 " + file.toAbsolutePath(), e);
            }
        }
    }

    public Optional<ClientRecord> findEnabled(String appId) {
        ClientRecord record = clients.get(appId);
        if (record == null || !record.enabled()) {
            return Optional.empty();
        }
        return Optional.of(record);
    }

    public List<ClientRecord> list() {
        return clients.values().stream()
                .sorted(Comparator.comparing(ClientRecord::createdAt))
                .toList();
    }

    public synchronized ClientRecord create(String name, String userNo) {
        String trimmedName = name == null ? "" : name.trim();
        if (trimmedName.isBlank()) {
            throw new IllegalArgumentException("name 不能为空");
        }
        boolean duplicated = clients.values().stream()
                .anyMatch(item -> item.enabled() && trimmedName.equalsIgnoreCase(item.name()));
        if (duplicated) {
            throw new IllegalArgumentException("已存在同名客户，请换一个 name");
        }
        ClientRecord record = new ClientRecord(
                newAppId(trimmedName),
                newAppKey(),
                trimmedName,
                userNo == null || userNo.isBlank() ? properties.clients().stream()
                        .map(ZhongguanProperties.Client::userNo)
                        .filter(value -> value != null && !value.isBlank())
                        .findFirst()
                        .orElse("08") : userNo.trim(),
                true,
                Instant.now()
        );
        clients.put(record.appId(), record);
        persistFileClients();
        log.info("已开通客户 name={} appId={}", record.name(), record.appId());
        return record;
    }

    public synchronized ClientRecord disable(String appId) {
        ClientRecord existing = clients.get(appId);
        if (existing == null) {
            throw new IllegalArgumentException("客户不存在");
        }
        ClientRecord disabled = existing.disabled();
        clients.put(appId, disabled);
        persistFileClients();
        return disabled;
    }

    private void persistFileClients() {
        List<ClientRecord> stored = clients.values().stream()
                .filter(item -> item.createdAt() != Instant.EPOCH)
                .sorted(Comparator.comparing(ClientRecord::createdAt))
                .toList();
        Path file = clientsFile();
        try {
            Files.createDirectories(file.getParent() == null ? Path.of(".") : file.getParent());
            fileMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), stored);
        } catch (IOException e) {
            throw new IllegalStateException("无法写入 " + file.toAbsolutePath(), e);
        }
    }

    private Path clientsFile() {
        return Path.of(properties.clientsFile());
    }

    private static String newAppId(String name) {
        String slug = name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "");
        if (slug.length() > 12) {
            slug = slug.substring(0, 12);
        }
        if (slug.isBlank()) {
            slug = "client";
        }
        return "zg-" + slug + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private static String newAppKey() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
