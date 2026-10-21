#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
}

@dataclass(frozen=True)
class SourceDoc:
    export_name: str
    title: str
    path: Path


@dataclass(frozen=True)
class ProfileExtraction:
    embedded_digests: dict[str, str]
    privacy_embedded_name: str
    cmcc_embedded_name: str
    partner_name: str
    partner_policy_title: str
    third_party_export_name: str
    privacy_export_name: str
    cmcc_export_name: str
    third_party_doc_key: str
    privacy_doc_key: str
    cmcc_doc_key: str
    privacy_filename: str


PROFILE_EXTRACTIONS = {
    "haike-v2": ProfileExtraction(
        embedded_digests={
            "Document1.docx": "7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185",
            "oleObject1.bin": "4a6166efab527d28a4704e0ec0df305406d3de1ba0685de73dba85039be1e4f0",
        },
        privacy_embedded_name="oleObject1.bin",
        cmcc_embedded_name="Document1.docx",
        partner_name="海客（天津）保险经纪有限公司",
        partner_policy_title="《蓝鲸保隐私政策》",
        third_party_export_name="HAIKE_V2_THIRD_PARTY_SHARING_AGREEMENT",
        privacy_export_name="HAIKE_V2_PRIVACY_POLICY_AGREEMENT",
        cmcc_export_name="HAIKE_V2_CMCC_PRIVACY_POLICY_AGREEMENT",
        third_party_doc_key="haike-v2-third-party-sharing",
        privacy_doc_key="haike-v2-privacy-policy",
        cmcc_doc_key="haike-v2-cmcc-privacy-policy",
        privacy_filename="haikePrivacyPolicy.ts",
    ),
    "tiantianyoubao-v2": ProfileExtraction(
        embedded_digests={
            "Document1.docx": "7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185",
            "oleObject1.bin": "d8439d55d18cff6ba89f40924dee45651ca280c53ac5f3b4fc478583caa31fd7",
        },
        privacy_embedded_name="oleObject1.bin",
        cmcc_embedded_name="Document1.docx",
        partner_name="天天有保（湖南）保险经纪服务有限公司",
        partner_policy_title="《个人隐私协议》",
        third_party_export_name="TIANTIANYOUBAO_V2_THIRD_PARTY_SHARING_AGREEMENT",
        privacy_export_name="TIANTIANYOUBAO_V2_PRIVACY_POLICY_AGREEMENT",
        cmcc_export_name="TIANTIANYOUBAO_V2_CMCC_PRIVACY_POLICY_AGREEMENT",
        third_party_doc_key="tiantianyoubao-v2-third-party-sharing",
        privacy_doc_key="tiantianyoubao-v2-privacy-policy",
        cmcc_doc_key="tiantianyoubao-v2-cmcc-privacy-policy",
        privacy_filename="tiantianyoubaoPrivacyPolicy.ts",
    ),
    "dongfangdadi-v2": ProfileExtraction(
        embedded_digests={
            "Microsoft_Word_Document.docx": "e04cd43bb8a833898ae35ca133c415aa1d36a0c0f9db548d04f978a3ea3016e9",
            "Microsoft_Word_Document1.docx": "7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185",
        },
        privacy_embedded_name="Microsoft_Word_Document.docx",
        cmcc_embedded_name="Microsoft_Word_Document1.docx",
        partner_name="东方大地（武汉）保险经纪有限公司",
        partner_policy_title="《隐私政策》",
        third_party_export_name="DONGFANGDADI_V2_THIRD_PARTY_SHARING_AGREEMENT",
        privacy_export_name="DONGFANGDADI_V2_PRIVACY_POLICY_AGREEMENT",
        cmcc_export_name="DONGFANGDADI_V2_CMCC_PRIVACY_POLICY_AGREEMENT",
        third_party_doc_key="dongfangdadi-v2-third-party-sharing",
        privacy_doc_key="dongfangdadi-v2-privacy-policy",
        cmcc_doc_key="dongfangdadi-v2-cmcc-privacy-policy",
        privacy_filename="dongfangdadiPrivacyPolicy.ts",
    ),
    "anxingtianxia-v2": ProfileExtraction(
        embedded_digests={
            "Microsoft_Word_Document.docx": "b8bd31afa8c17c132396649386a0264d5a4216f7c233bc0120da6131f3af1613",
            "Microsoft_Word_Document1.docx": "7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185",
        },
        privacy_embedded_name="Microsoft_Word_Document.docx",
        cmcc_embedded_name="Microsoft_Word_Document1.docx",
        partner_name="安行天下保险经纪（上海）有限公司",
        partner_policy_title="《安行天下个人信息保护政策》",
        third_party_export_name="ANXINGTIANXIA_V2_THIRD_PARTY_SHARING_AGREEMENT",
        privacy_export_name="ANXINGTIANXIA_V2_PRIVACY_POLICY_AGREEMENT",
        cmcc_export_name="ANXINGTIANXIA_V2_CMCC_PRIVACY_POLICY_AGREEMENT",
        third_party_doc_key="anxingtianxia-v2-third-party-sharing",
        privacy_doc_key="anxingtianxia-v2-privacy-policy",
        cmcc_doc_key="anxingtianxia-v2-cmcc-privacy-policy",
        privacy_filename="anxingtianxiaPrivacyPolicy.ts",
    ),
    "hengda-v2": ProfileExtraction(
        embedded_digests={
            "Microsoft_Word_Document.docx": "ce9ef9fd1a4a5e9472a353ef4d2638e32b40927aebf8375f919e9842d7c8a7c5",
            "Microsoft_Word_Document1.docx": "7035d9cfe38758731d5a1b0c02328b9bbb39d924f5eace0dcb5bae9e8c5a5185",
        },
        privacy_embedded_name="Microsoft_Word_Document.docx",
        cmcc_embedded_name="Microsoft_Word_Document1.docx",
        partner_name="恒大保险经纪有限公司",
        partner_policy_title="《恒大保险经纪隐私政策》",
        third_party_export_name="HENGDA_V2_THIRD_PARTY_SHARING_AGREEMENT",
        privacy_export_name="HENGDA_V2_PRIVACY_POLICY_AGREEMENT",
        cmcc_export_name="HENGDA_V2_CMCC_PRIVACY_POLICY_AGREEMENT",
        third_party_doc_key="hengda-v2-third-party-sharing",
        privacy_doc_key="hengda-v2-privacy-policy",
        cmcc_doc_key="hengda-v2-cmcc-privacy-policy",
        privacy_filename="hengdaPrivacyPolicy.ts",
    ),
}


SOURCE_DOCS = [
    SourceDoc(
        export_name="SENSITIVE_INFO_RULES_AGREEMENT",
        title="《敏感个人信息处理规则》",
        path=Path(__file__).resolve().parents[1] / "docs/1-协议原文/附件五 敏感个人信息处理规则 发布版V1.0_2026.docx",
    ),
    SourceDoc(
        export_name="THIRD_PARTY_SHARING_LIST_AGREEMENT",
        title="《第三方共享个人信息清单》",
        path=Path(__file__).resolve().parents[1] / "docs/1-协议原文/附件三 第三方共享个人信息清单 V2-通用(1).docx",
    ),
    SourceDoc(
        export_name="PERSONAL_INFO_COLLECTION_LIST_AGREEMENT",
        title="《个人信息收集清单》",
        path=Path(__file__).resolve().parents[1] / "docs/1-协议原文/附件二 个人信息收集清单 发布版 V1.0_2026.docx",
    ),
    SourceDoc(
        export_name="USER_AUTH_PRIVACY_POLICY_AGREEMENT",
        title="《用户认证服务隐私政策》",
        path=Path(__file__).resolve().parents[1] / "docs/1-协议原文/附件一 用户认证服务隐私政策 发布版V1.0_206.docx",
    ),
]


def qn(local_name: str) -> str:
    return f"{{{NS['w']}}}{local_name}"


def normalize_text(value: str) -> str:
    return re.sub(r"[ \t\r\f\v]+", " ", value).strip()


def text_from_element(element: ET.Element) -> str:
    parts: list[str] = []
    for text_node in element.findall(".//w:t", NS):
        if text_node.text:
            parts.append(text_node.text)
    return normalize_text("".join(parts))


def paragraph_kind(paragraph: ET.Element, is_first_text_block: bool) -> str:
    text = text_from_element(paragraph)
    if is_first_text_block:
        return "h1"

    ppr = paragraph.find("w:pPr", NS)
    if ppr is not None:
        outline = ppr.find("w:outlineLvl", NS)
        if outline is not None:
            value = outline.attrib.get(qn("val"))
            if value == "0":
                return "h1"
            if value == "1":
                return "h2"
            if value == "2":
                return "h3"

        if ppr.find("w:numPr", NS) is not None:
            return "li"

    if re.match(r"^[一二三四五六七八九十]+[、.．]", text):
        return "h1"
    if re.match(r"^（[一二三四五六七八九十]+）", text):
        return "h2"
    if re.match(r"^[0-9]+[、.．]", text):
        return "p"

    runs = paragraph.findall("w:r", NS)
    text_runs = [run for run in runs if text_from_element(run)]
    bold_runs = [run for run in text_runs if run.find("w:rPr/w:b", NS) is not None]
    if text_runs and len(text_runs) == len(bold_runs):
        return "b"

    return "p"


def parse_table(table: ET.Element) -> dict[str, object]:
    rows: list[list[object]] = []
    for tr in table.findall("w:tr", NS):
        row: list[object] = []
        for tc in tr.findall("w:tc", NS):
            cell_parts = [text_from_element(p) for p in tc.findall("w:p", NS)]
            text = "\n".join(part for part in cell_parts if part)
            grid_span = tc.find("w:tcPr/w:gridSpan", NS)
            col_span = int(grid_span.attrib.get(qn("val"), "1")) if grid_span is not None else 1
            row.append(
                {"kind": "text", "text": text, "colSpan": col_span}
                if col_span > 1
                else text
            )
        if any(
            (cell if isinstance(cell, str) else str(cell.get("text", ""))).strip()
            for cell in row
        ):
            rows.append(row)
    return {"kind": "table", "rows": rows}


def parse_docx_zip(docx_zip: zipfile.ZipFile, source: str) -> list[dict[str, object]]:
    xml = docx_zip.read("word/document.xml")

    root = ET.fromstring(xml)
    body = root.find("w:body", NS)
    if body is None:
        raise ValueError(f"{source} has no word/document.xml body")

    blocks: list[dict[str, object]] = []
    seen_text_block = False

    for child in body:
        if child.tag == qn("p"):
            text = text_from_element(child)
            if not text:
                continue
            kind = paragraph_kind(child, is_first_text_block=not seen_text_block)
            seen_text_block = True
            blocks.append({"kind": kind, "text": text})
        elif child.tag == qn("tbl"):
            table = parse_table(child)
            if table["rows"]:
                blocks.append(table)

    if not blocks:
        raise ValueError(f"{source} produced no agreement blocks")
    return blocks


def parse_docx(path: Path) -> list[dict[str, object]]:
    if not path.exists():
        raise FileNotFoundError(path)

    with zipfile.ZipFile(path) as docx_zip:
        return parse_docx_zip(docx_zip, str(path))


def parse_docx_bytes(data: bytes, source: str) -> list[dict[str, object]]:
    # Word OLE embeddings may wrap a valid DOCX ZIP with a leading CFB header.
    # zipfile supports such self-extracting-style prefixes and reads the
    # embedded package without publishing or executing the Office object.
    with zipfile.ZipFile(io.BytesIO(data)) as docx_zip:
        return parse_docx_zip(docx_zip, source)


def ts(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2)


def agreement_module(export_name: str, title: str, blocks: list[dict[str, object]]) -> str:
    return "\n".join([
        "import type { AgreementDoc } from '../../agreementTypes'",
        "",
        f"export const {export_name}: AgreementDoc = {{",
        f"  title: {ts(title)},",
        f"  blocks: {ts(blocks)},",
        "}",
        "",
    ])


def add_profile_doc_links(
    blocks: list[dict[str, object]],
    profile: ProfileExtraction,
) -> None:
    doc_links = {
        profile.partner_name: {
            "kind": "doc-link",
            "text": profile.partner_policy_title,
            "docKey": profile.privacy_doc_key,
        },
        "中移互联网有限公司": {
            "kind": "doc-link",
            "text": "《中国移动认证梧桐数盾隐私政策》",
            "docKey": profile.cmcc_doc_key,
        },
    }

    linked_partners: set[str] = set()
    for block in blocks:
        if block.get("kind") != "table":
            continue
        rows = block.get("rows")
        if not isinstance(rows, list):
            continue
        for row in rows:
            if not isinstance(row, list) or not row or not isinstance(row[0], str):
                continue
            link = doc_links.get(row[0])
            if link is None:
                continue
            if len(row) < 7:
                raise ValueError(f"Partner row has only {len(row)} cells: {row[0]}")
            row[5] = link
            linked_partners.add(row[0])

    if linked_partners != set(doc_links):
        missing = sorted(set(doc_links) - linked_partners)
        raise ValueError(f"Partner rows missing from source table: {missing}")


def normalize_cmcc_dates(blocks: list[dict[str, object]]) -> None:
    for block in blocks:
        if block.get("kind") == "table":
            rows = block.get("rows")
            if isinstance(rows, list):
                for row in rows:
                    if isinstance(row, list):
                        for index, cell in enumerate(row):
                            if isinstance(cell, str):
                                row[index] = cell.replace("⽉", "月")
            continue
        text = block.get("text")
        if isinstance(text, str):
            block["text"] = text.replace("⽉", "月")


def extract_profile(
    profile: ProfileExtraction,
    source: Path,
    output_dir: Path,
) -> None:
    if not source.exists():
        raise FileNotFoundError(source)

    with zipfile.ZipFile(source) as source_zip:
        main_blocks = parse_docx_zip(source_zip, str(source))
        embedded = {
            name: source_zip.read(f"word/embeddings/{name}")
            for name in profile.embedded_digests
        }

    for name, expected_digest in profile.embedded_digests.items():
        actual_digest = hashlib.sha256(embedded[name]).hexdigest()
        if actual_digest != expected_digest:
            raise ValueError(
                f"{name} SHA-256 mismatch: expected {expected_digest}, got {actual_digest}"
            )
        print(f"{name}  {actual_digest}")

    add_profile_doc_links(main_blocks, profile)
    cmcc_blocks = parse_docx_bytes(
        embedded[profile.cmcc_embedded_name],
        profile.cmcc_embedded_name,
    )
    privacy_blocks = parse_docx_bytes(
        embedded[profile.privacy_embedded_name],
        profile.privacy_embedded_name,
    )
    normalize_cmcc_dates(cmcc_blocks)

    output_dir.mkdir(parents=True, exist_ok=True)
    modules = {
        "thirdPartySharing.ts": agreement_module(
            profile.third_party_export_name,
            "《第三方共享个人信息清单》",
            main_blocks,
        ),
        profile.privacy_filename: agreement_module(
            profile.privacy_export_name,
            profile.partner_policy_title,
            privacy_blocks,
        ),
        "cmccPrivacyPolicy.ts": agreement_module(
            profile.cmcc_export_name,
            "《中国移动认证梧桐数盾隐私政策》",
            cmcc_blocks,
        ),
        "index.ts": "\n".join([
            f"export {{ {profile.third_party_export_name} }} from './thirdPartySharing'",
            f"export {{ {profile.privacy_export_name} }} from './{Path(profile.privacy_filename).stem}'",
            f"export {{ {profile.cmcc_export_name} }} from './cmccPrivacyPolicy'",
            "",
            f"export const {profile.third_party_export_name.removesuffix('_THIRD_PARTY_SHARING_AGREEMENT')}_AGREEMENT_DOC_KEYS = [",
            f"  '{profile.third_party_doc_key}',",
            f"  '{profile.privacy_doc_key}',",
            f"  '{profile.cmcc_doc_key}',",
            "] as const",
            "",
        ]),
    }
    for filename, content in modules.items():
        (output_dir / filename).write_text(content, encoding="utf-8")


def run_legacy_extraction() -> None:
    for source in SOURCE_DOCS:
        blocks = parse_docx(source.path)
        print(f"export const {source.export_name}: AgreementDoc = {{")
        print(f"  title: {ts(source.title)},")
        print(f"  blocks: {ts(blocks)},")
        print("}")
        print()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract static agreement content from DOCX")
    parser.add_argument("--profile", choices=sorted(PROFILE_EXTRACTIONS))
    parser.add_argument("--source", type=Path)
    parser.add_argument("--output-dir", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    profile_args = (args.profile, args.source, args.output_dir)
    if not any(profile_args):
        run_legacy_extraction()
        return 0
    if not all(profile_args):
        raise ValueError("--profile, --source and --output-dir must be provided together")

    extract_profile(PROFILE_EXTRACTIONS[args.profile], args.source, args.output_dir)
    return 0


if __name__ == "__main__":
    sys.exit(main())
