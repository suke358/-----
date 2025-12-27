const URLS = {
    '食事': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTTaLwPw_Umxz-kntpaLlE8-YJOefutrW2a1B-alKxA77zjQPjWUj8KZZ4PGG89HKssBCO7tlRe9S72/pub?gid=0&single=true&output=csv',
    '観光地': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTTaLwPw_Umxz-kntpaLlE8-YJOefutrW2a1B-alKxA77zjQPjWUj8KZZ4PGG89HKssBCO7tlRe9S72/pub?gid=56841696&single=true&output=csv'
};

let allData = [];

// HTMLのボタンから呼ばれる関数
async function switchCategory(category) {
    console.log(category + "を読み込み中...");
    
    // ボタンの見た目を切り替え
    const btnMeal = document.getElementById('btn-食事');
    const btnSpot = document.getElementById('btn-観光地');
    
    if (btnMeal) btnMeal.style.background = (category === '食事') ? '#4285f4' : '#ccc';
    if (btnSpot) btnSpot.style.background = (category === '観光地') ? '#4285f4' : '#ccc';
    
    // データを読み込む
    await loadData(URLS[category]);
}

async function loadData(url) {
    try {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.style.display = 'block';

        const res = await fetch(url);
        const text = await res.text();
        
        // CSVを分解（カンマ区切りの考慮）
        const rows = text.trim().split('\n').map(row => row.split(','));
        const headers = rows[0];
        const dataRows = rows.slice(1);

        allData = dataRows.map(row => {
            let obj = {};
            headers.forEach((header, index) => {
                const key = header.trim();
                obj[key] = row[index] ? row[index].trim() : "";
            });
            return obj;
        });

        renderTable(allData);
        
        if (loadingEl) loadingEl.style.display = 'none';
        // 検索窓やテーブルを表示
        if (document.getElementById('searchInput')) document.getElementById('searchInput').style.display = 'block';
        if (document.getElementById('restaurantTable')) document.getElementById('restaurantTable').style.display = 'table';
        
    } catch (err) {
        console.error('読み込みエラー:', err);
    }
}

function renderTable(data) {
    const tbody = document.querySelector('#restaurantTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    data.forEach(r => {
        // 「店名」というキーでデータを探す
        const name = r['店名'] || r['お店名']; 
        if (!name) return;

        const tr = document.createElement('tr');
        const price = r['予算'] ? '¥' + Number(r['予算']).toLocaleString() : '-';

        tr.innerHTML = `
            <td><strong>${name}</strong></td>
            <td>${r['カテゴリ'] || '-'}</td>
            <td>${r['場所'] || '-'}</td>
            <td class="stars">${'★'.repeat(Math.min(5, parseInt(r['評価']) || 0))}</td>
            <td>${price}</td>
            <td>${r['所要時間'] || '-'}</td>
        `;

        tr.onclick = () => {
            document.getElementById('modal-title').textContent = name;
            document.getElementById('modal-img').src = r['画像URL'] || '';
            document.getElementById('modal-desc').innerHTML = `
                <p><strong>場所:</strong> ${r['場所'] || '-'}</p>
                <p><strong>予算/入場料:</strong> ${price}</p>
                <p><strong>所要時間:</strong> ${r['所要時間'] || '-'}</p>
                <p><strong>備考:</strong> ${r['備考'] || '-'}</p>
                <hr>
                <a href="${r['マップ']}" target="_blank" style="display:inline-block; margin-top:10px; padding:10px 20px; background:#4285f4; color:white; text-decoration:none; border-radius:5px;">Googleマップで開く</a>
            `;
            document.getElementById('modal').style.display = 'flex';
        };
        tbody.appendChild(tr);
    });
}

// 検索機能のセットアップ
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase();
        renderTable(allData.filter(r => {
            const name = (r['店名'] || r['お店名'] || "").toLowerCase();
            const cat = (r['カテゴリ'] || "").toLowerCase();
            return name.includes(query) || cat.includes(query);
        }));
    };
}

// モーダルを閉じる
const closeBtn = document.querySelector('.close');
if (closeBtn) closeBtn.onclick = () => document.getElementById('modal').style.display = 'none';

// 起動時に「食事」を読み込む
switchCategory('食事');