import { ModelProvider } from './name-prompt';

const CHINA_IP_PATTERNS = [
  /^1\.(?:10|12[0-5]|2[5-9][0-9])\./,
  /^27\.(?:0|1[0-9]|2[0-5])\./,
  /^36\.(?:16|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-3])\./,
  /^42\.(?:0|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\./,
  /^49\.(?:[7-9]|1[0-1]|12[0-7])\./,
  /^58\.(?:1[4-9]|2[0-9]|3[0-1])\./,
  /^59\.(?:3[2-9]|4[0-9]|5[0-5])\./,
  /^60\.(?:1[6-9]|2[0-9]|3[0-1])\./,
  /^61\.(?:2[4-9]|3[0-9]|4[0-1][0-9]|52[0-3])\./,
  /^1(?:01|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39)\./,
  /^1(?:40|41|42|43|44|45|46|47|48|49)\./,
  /^1(?:50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99)\./,
  /^2(?:02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99)\./,
  /^222\./,
];

const CHINA_ASN_PREFIXES = ['4134', '4837', '9929', '9801', '9394', '45071', '24547', '58461', '132203', '139646', '142571'];

export async function detectUserRegion(): Promise<ModelProvider> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code || data.country || '';
      const asn = data.asn || '';

      if (countryCode === 'CN') {
        console.log('🌐 IP Detection: China mainland detected');
        return 'deepseek';
      }

      if (CHINA_ASN_PREFIXES.some(prefix => asn.toString().startsWith(prefix))) {
        console.log('🌐 IP Detection: China ASN detected');
        return 'deepseek';
      }

      const clientIp = data.ip || '';
      for (const pattern of CHINA_IP_PATTERNS) {
        if (pattern.test(clientIp)) {
          console.log('🌐 IP Detection: China IP range detected');
          return 'deepseek';
        }
      }

      console.log('🌐 IP Detection: International user, routing to Gemini');
      return 'gemini';
    }
  } catch (error) {
    console.error('🌐 IP Detection failed, defaulting to Gemini:', error);
  }

  console.log('🌐 IP Detection: Defaulting to Gemini');
  return 'gemini';
}

export function isChinaIP(ip: string): boolean {
  for (const pattern of CHINA_IP_PATTERNS) {
    if (pattern.test(ip)) {
      return true;
    }
  }
  return false;
}
