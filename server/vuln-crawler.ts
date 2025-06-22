import { storage } from "./storage";
import { InsertVulnerability } from "@shared/schema";
import axios from "axios";
import { load } from "cheerio";
import type { Element } from "domhandler";
interface NVDResponse {
  result: {
    CVE_Items: Array<{
      cve: {
        CVE_data_meta: { ID: string };
        description: { description_data: Array<{ value: string }> };
      };
      impact: {
        baseMetricV3?: { cvssV3?: { baseSeverity: string } };
        baseMetricV2?: { severity: string };
      };
      publishedDate: string;
    }>;
  };
}
const NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/1.0";
const NVD_RESULTS_PER_PAGE = 20;
const CNNVD_BASE_URL = "http://www.cnnvd.org.cn";
export async function crawlVulnerabilities(source: string): Promise<void> {
  console.log(`开始从 ${source} 抓取漏洞...`);
  
  try {
    let vulnerabilitiesToInsert: InsertVulnerability[] = [];
    
    switch (source) {
      case "NVD":
        vulnerabilitiesToInsert = await crawlNVD();
        break;
      case "CNNVD":
        vulnerabilitiesToInsert = await crawlCNNVD();
        break;
      default:
        console.warn(`未知漏洞源: ${source}`);
        return;
    }
    const saveResults = await Promise.allSettled(
      vulnerabilitiesToInsert.map(vuln => 
        storage.createVulnerability(vuln)
      )
    );
    const successCount = saveResults.filter(r => r.status === "fulfilled").length;
    const failCount = saveResults.filter(r => r.status === "rejected").length;
    console.log(`从 ${source} 抓取完成. 成功保存 ${successCount} 条, 失败 ${failCount} 条`);
  } catch (error) {
    console.error(`从 ${source} 抓取漏洞失败:`, error);
    throw error;
  }
}
async function crawlNVD(): Promise<InsertVulnerability[]> {
  console.log("从 NVD API 抓取漏洞数据...");
  
  try {
    const response = await axios.get<NVDResponse>(NVD_API_URL, {
      params: {
        resultsPerPage: NVD_RESULTS_PER_PAGE,
        startIndex: 0
      }
    });
    
    return response.data.result.CVE_Items.map((item) => {
      const cve = item.cve;
      const impact = item.impact;
      
      return {
        title: cve.CVE_data_meta.ID,
        description: cve.description.description_data[0].value,
        cveId: cve.CVE_data_meta.ID,
        severity: impact.baseMetricV3?.cvssV3?.baseSeverity || 
                 impact.baseMetricV2?.severity || "未知",
        publishedDate: new Date(item.publishedDate),
        source: "NVD",
        url: `https://nvd.nist.gov/vuln/detail/${cve.CVE_data_meta.ID}`,
        userId: null
      };
    });
  } catch (error) {
    console.error("NVD API 请求失败:", error);
    throw error;
  }
}
async function crawlCNNVD(): Promise<InsertVulnerability[]> {
  console.log("从 CNNVD 网站抓取漏洞数据...");
  
  try {
    const response = await axios.get(`${CNNVD_BASE_URL}/web/vulnerability/querylist.tag`, {
      params: {
        pageno: 1,
        repaireLd: ""
      }
    });
    const $ = load(response.data);
    const vulnerabilities: InsertVulnerability[] = [];
    
    $('.list_list tbody tr').each((i: number, element: Element) => {
      const cols = $(element).find('td');
      const cnnvdId = $(cols[1]).text().trim();
      const title = $(cols[2]).text().trim();
      const severity = $(cols[3]).text().trim();
      const publishedDate = new Date($(cols[4]).text().trim());
      
      vulnerabilities.push({
        title,
        description: `CNNVD漏洞: ${title}`,
        cveId: cnnvdId.includes('CNNVD') ? cnnvdId : null,
        severity,
        publishedDate,
        source: "CNNVD",
        url: `${CNNVD_BASE_URL}/web/xxk/ldxqById.tag?CNNVD=${cnnvdId}`,
        userId: null
      });
    });
    return vulnerabilities;
  } catch (error) {
    console.error("CNNVD 抓取失败:", error);
    throw error;
  }
}
