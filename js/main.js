const URLS = {
    '食事': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTTaLwPw_Umxz-kntpaLlE8-YJOefutrW2a1B-alKxA77zjQPjWUj8KZZ4PGG89HKssBCO7tlRe9S72/pub?gid=0&single=true&output=csv',
    '観光地': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTTaLwPw_Umxz-kntpaLlE8-YJOefutrW2a1B-alKxA77zjQPjWUj8KZZ4PGG89HKssBCO7tlRe9S72/pub?gid=56841696&single=true&output=csv'
};

let allData = [];

// カテゴリを切り替える関数
async function switchCategory(category) {
    // ボタンの色を変える
    document.getElementById('btn-食事').style.background = (category === '食事') ? '#4285f4' : '#ccc';
    document.getElementById('btn-観光地').style.background = (category === '観光地') ? '#4285f4' : '#ccc';
    
    // データを読み込み直す
    await loadData(URLS[category]);
}

async function loadData(url) {
    try {
        document.getElementById('loading').style.display = 'block';
        const res = await fetch(url);
        const text = await res.text();
        const rows = text.trim().split('\n').map(row => row.split(','));
        const headers = rows[0];
        const dataRows = rows.slice(1);

        allData = dataRows.map(row => {
            let obj = {};
            headers.forEach((header, index) => {
                obj[header.trim()] = row[index] ? row[index].trim() : "";
            });
            return obj;
        });

        renderTable(allData);
        document.getElementById('loading').style.display = 'none';
    } catch (err) {
        console.error('読み込みエラー:', err);
    }
}

function renderTable(data) {
    const tbody = document.querySelector('#restaurantTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    data.forEach(r => {
        if (!r['店名']) return;
        const tr = document.createElement('tr');
        const price = r['予算'] ? '¥' + Number(r['予算']).toLocaleString() : '-';

        tr.innerHTML = `
            <td><strong>${r['店名']}</strong></td>
            <td>${r['カテゴリ']}</td>
            <td>${r['場所']}</td>
            <td class="stars">${'★'.repeat(Math.min(5, parseInt(r['評価']) || 0))}</td>
            <td>${price}</td>
            <td>${r['所要時間'] || '-'}</td>
        `;

        tr.onclick = () => {
            document.getElementById('modal-title').textContent = r['店名'];
            document.getElementById('modal-img').src = r['画像URL'] || '';
            document.getElementById('modal-desc').innerHTML = `
                <p><strong>場所:</strong> ${r['場所']}</p>
                <p><strong>${r['予算'] == '0' ? '入場料' : '予算'}:</strong> ${price}</p>
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

// 検索機能
document.getElementById('searchInput').oninput = (e) => {
    const query = e.target.value.toLowerCase();
    renderTable(allData.filter(r => 
        (r['店名'] && r['店名'].toLowerCase().includes(query)) || 
        (r['カテゴリ'] && r['カテゴリ'].toLowerCase().includes(query))
    ));
};

// 閉じる処理
document.querySelector('.close').onclick = () => document.getElementById('modal').style.display = 'none';

// 最初に「食事」を読み込む
switchCategory('食事');