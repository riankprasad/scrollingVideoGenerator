<?php
date_default_timezone_set('Asia/Kolkata');
$appConfig = [
  'mysql' => [
    'enabled' => false,
    'host' => '127.0.0.1',
    'port' => 3306,
    'user' => 'root',
    'pass' => '',
    'database' => 'scrolling_video_generator',
    'charset' => 'utf8mb4',
  ],
];
if (file_exists(__DIR__ . '/config.php')) {
  $configFromFile = include __DIR__ . '/config.php';
  if (is_array($configFromFile)) {
    $appConfig = array_replace_recursive($appConfig, $configFromFile);
  }
}
$view = $_GET['view'] ?? 'home';
if (!in_array($view, ['home', 'video', 'caption', 'experimental', 'ig-download', 'yt-download'], true)) {
  $view = 'home';
}
function respond_json($payload, $status = 200) {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function slugify($text) {
  $text = strtolower(trim($text));
  $text = preg_replace('/[^a-z0-9]+/i', '-', $text);
  $text = trim($text, '-');
  return $text !== '' ? $text : 'general';
}

function mysql_enabled($config) {
  return !empty($config['mysql']['enabled']);
}

function get_mysql_connection($config) {
  if (!mysql_enabled($config)) {
    return null;
  }
  $host = $config['mysql']['host'] ?? '127.0.0.1';
  $port = $config['mysql']['port'] ?? 3306;
  $user = $config['mysql']['user'] ?? 'root';
  $pass = $config['mysql']['pass'] ?? '';
  $db = $config['mysql']['database'] ?? 'scrolling_video_generator';
  $charset = $config['mysql']['charset'] ?? 'utf8mb4';

  try {
    $dsnRoot = "mysql:host={$host};port={$port};charset={$charset}";
    $pdoRoot = new PDO($dsnRoot, $user, $pass, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $pdoRoot->exec("CREATE DATABASE IF NOT EXISTS `{$db}` CHARACTER SET {$charset} COLLATE {$charset}_unicode_ci");

    $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";
    $pdo = new PDO($dsn, $user, $pass, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $pdo->exec("CREATE TABLE IF NOT EXISTS captions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(191) UNIQUE,
      title VARCHAR(255),
      profile VARCHAR(255),
      category VARCHAR(191),
      category_slug VARCHAR(191),
      post_date VARCHAR(32),
      post_day VARCHAR(16),
      post_time VARCHAR(16),
      hashtags TEXT,
      content MEDIUMTEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET={$charset}");
    return $pdo;
  } catch (Exception $e) {
    return null;
  }
}

function load_posts_from_json() {
  $postsFile = __DIR__ . '/captions/posts.json';
  if (!file_exists($postsFile)) {
    return [];
  }
  $decoded = json_decode(file_get_contents($postsFile), true);
  return is_array($decoded) ? $decoded : [];
}

function save_posts_to_json($posts) {
  if (!is_dir(__DIR__ . '/captions')) {
    mkdir(__DIR__ . '/captions', 0775, true);
  }
  $postsFile = __DIR__ . '/captions/posts.json';
  file_put_contents($postsFile, json_encode($posts, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

function load_posts($pdo) {
  if ($pdo instanceof PDO) {
    $stmt = $pdo->query('SELECT slug, title, profile, category, category_slug, post_date, post_day, post_time, hashtags, content, created_at FROM captions ORDER BY id ASC');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map(function ($row) {
      return [
        'slug' => $row['slug'],
        'title' => $row['title'],
        'profile' => $row['profile'],
        'category' => $row['category'],
        'category_slug' => $row['category_slug'],
        'date' => $row['post_date'],
        'day' => $row['post_day'],
        'time' => $row['post_time'],
        'hashtags' => $row['hashtags'],
        'content' => $row['content'],
        'created_at' => date('c', strtotime($row['created_at'])),
      ];
    }, $rows);
  }
  return load_posts_from_json();
}

function save_post($pdo, $post) {
  if ($pdo instanceof PDO) {
    $stmt = $pdo->prepare('INSERT INTO captions (slug, title, profile, category, category_slug, post_date, post_day, post_time, hashtags, content, created_at) VALUES (:slug, :title, :profile, :category, :category_slug, :post_date, :post_day, :post_time, :hashtags, :content, NOW())');
    $stmt->execute([
      ':slug' => $post['slug'],
      ':title' => $post['title'],
      ':profile' => $post['profile'],
      ':category' => $post['category'],
      ':category_slug' => $post['category_slug'],
      ':post_date' => $post['date'],
      ':post_day' => $post['day'],
      ':post_time' => $post['time'],
      ':hashtags' => $post['hashtags'],
      ':content' => $post['content'],
    ]);
    return;
  }
  $posts = load_posts_from_json();
  $posts[] = $post;
  save_posts_to_json($posts);
}

function increment_page_counter($view) {
  $file = __DIR__ . '/data/page-views.json';
  if (!is_dir(__DIR__ . '/data')) {
    mkdir(__DIR__ . '/data', 0775, true);
  }
  $data = [];
  if (file_exists($file)) {
    $decoded = json_decode(file_get_contents($file), true);
    if (is_array($decoded)) {
      $data = $decoded;
    }
  }
  $data['total'] = ($data['total'] ?? 0) + 1;
  $data[$view] = ($data[$view] ?? 0) + 1;
  file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
  return $data;
}

function load_local_fonts() {
  $fontsDir = __DIR__ . '/fonts';
  if (!is_dir($fontsDir)) {
    return ['css' => '', 'options' => ''];
  }
  $files = array_merge(
    glob($fontsDir . '/*.ttf') ?: [],
    glob($fontsDir . '/*.otf') ?: [],
    glob($fontsDir . '/*.woff') ?: [],
    glob($fontsDir . '/*.woff2') ?: []
  );
  $css = '';
  $options = '';
  foreach ($files as $file) {
    $filename = basename($file);
    $name = preg_replace('/\.[^.]+$/', '', $filename);
    $label = str_replace(['-', '_'], ' ', $name);
    $family = preg_replace('/[^a-z0-9\s]/i', '', $label);
    $family = trim($family);
    if ($family === '') {
      continue;
    }
    $url = '/fonts/' . rawurlencode($filename);
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $format = $ext === 'ttf' ? 'truetype' : ($ext === 'otf' ? 'opentype' : $ext);
    $css .= "@font-face{font-family:'{$family}';src:url('{$url}') format('{$format}');font-display:swap;}\n";
    $options .= '<option value="' . htmlspecialchars($family, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '">' . htmlspecialchars($family, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . "</option>\n";
  }
  return ['css' => $css, 'options' => $options];
}

$pdo = get_mysql_connection($appConfig);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'save_caption') {
  $caption = trim($_POST['caption'] ?? '');
  if ($caption === '') {
    respond_json(['ok' => false, 'message' => 'Caption is required.'], 400);
  }

  $title = trim($_POST['title'] ?? '');
  $profile = trim($_POST['profile'] ?? '');
  $date = trim($_POST['date'] ?? '');
  $day = trim($_POST['day'] ?? '');
  $time = trim($_POST['time'] ?? '');
  $hashtags = trim($_POST['hashtags'] ?? '');
  $siteUrl = trim($_POST['siteUrl'] ?? '');

  $category = trim($_POST['category'] ?? '');
  $categorySlug = slugify($category !== '' ? $category : 'general');

  $base = $title !== '' ? $title : ($profile !== '' ? $profile : 'caption');
  $slug = slugify($base);
  $unique = date('dmy') . '-' . substr(bin2hex(random_bytes(2)), 0, 4);
  $slug = $slug . '-' . $unique;

  $captionDir = __DIR__ . '/captions/' . $slug;
  if (!is_dir($captionDir) && !mkdir($captionDir, 0775, true)) {
    respond_json(['ok' => false, 'message' => 'Failed to create caption directory.'], 500);
  }

  $titleText = $title !== '' ? $title : 'Caption';
  $captionEsc = htmlspecialchars($caption, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $titleEsc = htmlspecialchars($titleText, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $metaDesc = htmlspecialchars(mb_substr(preg_replace('/\s+/', ' ', $caption), 0, 160), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $profileEsc = htmlspecialchars($profile, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $dateEsc = htmlspecialchars($date, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $dayEsc = htmlspecialchars($day, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $timeEsc = htmlspecialchars($time, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $hashtagsEsc = htmlspecialchars($hashtags, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

  $pageHtml = "<!doctype html>\n<html lang=\"en\">\n<head>\n" .
    "  <meta charset=\"utf-8\" />\n" .
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n" .
    "  <title>{$titleEsc}</title>\n" .
    "  <meta name=\"description\" content=\"{$metaDesc}\" />\n" .
    "  <style>body{font-family:Inter,system-ui,sans-serif;background:#0b0f1a;color:#e7ecf3;margin:0;padding:32px;}" .
    ".card{max-width:860px;margin:0 auto;background:#111827;border:1px solid #1f2a44;border-radius:16px;padding:24px;}" .
    ".meta{color:#9fb1d6;font-size:14px;margin-bottom:16px;}pre{white-space:pre-wrap;font-size:16px;line-height:1.5;}</style>\n" .
    "</head>\n<body>\n<div class=\"card\">\n" .
    "  <h1>{$titleEsc}</h1>\n" .
    "  <div class=\"meta\">Profile: {$profileEsc} | Date: {$dateEsc} {$timeEsc} | Day: {$dayEsc}</div>\n" .
    "  <pre>{$captionEsc}</pre>\n" .
    ($hashtagsEsc !== '' ? "  <div class=\"meta\">Hashtags: {$hashtagsEsc}</div>\n" : '') .
    "</div>\n</body>\n</html>";

  file_put_contents($captionDir . '/index.html', $pageHtml);

  $postRecord = [
    'slug' => $slug,
    'title' => $titleText,
    'profile' => $profile,
    'category' => $category !== '' ? $category : 'General',
    'category_slug' => $categorySlug,
    'date' => $date,
    'day' => $day,
    'time' => $time,
    'hashtags' => $hashtags,
    'content' => $caption,
    'created_at' => date('c'),
  ];
  save_post($pdo, $postRecord);

  $listItems = '';
  $posts = load_posts($pdo);
  foreach (array_reverse($posts) as $post) {
    $itemTitle = htmlspecialchars($post['title'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $itemSlug = htmlspecialchars($post['slug'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $itemDate = htmlspecialchars(($post['date'] ?? '') . ' ' . ($post['time'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $createdAt = htmlspecialchars($post['created_at'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $listItems .= "<li><a href=\"/captions/{$itemSlug}/\">{$itemTitle}</a> <span>{$itemDate}</span> <span>Saved: {$createdAt}</span></li>\n";
  }
  $indexHtml = "<!doctype html>\n<html lang=\"en\">\n<head>\n" .
    "  <meta charset=\"utf-8\" />\n" .
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n" .
    "  <title>Caption Library</title>\n" .
    "  <style>body{font-family:Inter,system-ui,sans-serif;background:#0b0f1a;color:#e7ecf3;margin:0;padding:32px;}" .
    ".card{max-width:860px;margin:0 auto;background:#111827;border:1px solid #1f2a44;border-radius:16px;padding:24px;}" .
    "a{color:#6ee7ff;text-decoration:none;}li{margin:8px 0;}span{color:#9fb1d6;margin-left:8px;font-size:13px;}</style>\n" .
    "</head>\n<body>\n<div class=\"card\">\n" .
    "  <h1>Caption Library</h1>\n" .
    "  <ul>{$listItems}</ul>\n" .
    "  <p><a href=\"/directory/\">Browse Directory</a></p>\n" .
    "</div>\n</body>\n</html>";
  if (!is_dir(__DIR__ . '/captions')) {
    mkdir(__DIR__ . '/captions', 0775, true);
  }
  file_put_contents(__DIR__ . '/captions/index.html', $indexHtml);

  $directory = [];
  foreach ($posts as $post) {
    $cat = $post['category'] ?? 'General';
    $catSlug = $post['category_slug'] ?? slugify($cat);
    if (!isset($directory[$catSlug])) {
      $directory[$catSlug] = [
        'name' => $cat,
        'posts' => [],
      ];
    }
    $directory[$catSlug]['posts'][] = $post;
  }

  $directoryDir = __DIR__ . '/directory';
  if (!is_dir($directoryDir)) {
    mkdir($directoryDir, 0775, true);
  }

  $directoryIndexItems = '';
  foreach ($directory as $catSlug => $catData) {
    $catName = htmlspecialchars($catData['name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $catSlugEsc = htmlspecialchars($catSlug, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $count = count($catData['posts']);
    $directoryIndexItems .= "<li><a href=\"/directory/{$catSlugEsc}/\">{$catName}</a> <span>({$count})</span></li>\n";

    $catListItems = '';
    foreach (array_reverse($catData['posts']) as $catPost) {
      $catTitle = htmlspecialchars($catPost['title'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $catSlugPost = htmlspecialchars($catPost['slug'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $catDate = htmlspecialchars(($catPost['date'] ?? '') . ' ' . ($catPost['time'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $catListItems .= "<li><a href=\"/captions/{$catSlugPost}/\">{$catTitle}</a> <span>{$catDate}</span></li>\n";
    }
    $catPage = "<!doctype html>\n<html lang=\"en\">\n<head>\n" .
      "  <meta charset=\"utf-8\" />\n" .
      "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n" .
      "  <title>{$catName} Directory</title>\n" .
      "  <style>body{font-family:Inter,system-ui,sans-serif;background:#0b0f1a;color:#e7ecf3;margin:0;padding:32px;}" .
      ".card{max-width:860px;margin:0 auto;background:#111827;border:1px solid #1f2a44;border-radius:16px;padding:24px;}" .
      "a{color:#6ee7ff;text-decoration:none;}li{margin:8px 0;}span{color:#9fb1d6;margin-left:8px;font-size:13px;}</style>\n" .
      "</head>\n<body>\n<div class=\"card\">\n" .
      "  <h1>{$catName} Directory</h1>\n" .
      "  <ul>{$catListItems}</ul>\n" .
      "  <p><a href=\"/directory/\">Back to Directory</a></p>\n" .
      "</div>\n</body>\n</html>";
    $catDir = $directoryDir . '/' . $catSlug;
    if (!is_dir($catDir)) {
      mkdir($catDir, 0775, true);
    }
    file_put_contents($catDir . '/index.html', $catPage);
  }

  $directoryIndex = "<!doctype html>\n<html lang=\"en\">\n<head>\n" .
    "  <meta charset=\"utf-8\" />\n" .
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n" .
    "  <title>Creator Directory</title>\n" .
    "  <style>body{font-family:Inter,system-ui,sans-serif;background:#0b0f1a;color:#e7ecf3;margin:0;padding:32px;}" .
    ".card{max-width:860px;margin:0 auto;background:#111827;border:1px solid #1f2a44;border-radius:16px;padding:24px;}" .
    "a{color:#6ee7ff;text-decoration:none;}li{margin:8px 0;}span{color:#9fb1d6;margin-left:8px;font-size:13px;}</style>\n" .
    "</head>\n<body>\n<div class=\"card\">\n" .
    "  <h1>Creator Directory</h1>\n" .
    "  <ul>{$directoryIndexItems}</ul>\n" .
    "</div>\n</body>\n</html>";
  file_put_contents($directoryDir . '/index.html', $directoryIndex);

  if ($siteUrl !== '') {
    $siteUrl = rtrim($siteUrl, '/');
    $url = $siteUrl . '/captions/' . $slug . '/';
    $sitemapFile = __DIR__ . '/sitemap.xml';
    $doc = new DOMDocument('1.0', 'UTF-8');
    $doc->formatOutput = true;
    if (file_exists($sitemapFile)) {
      $doc->load($sitemapFile);
      $urlset = $doc->getElementsByTagName('urlset')->item(0);
    } else {
      $urlset = $doc->createElement('urlset');
      $urlset->setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
      $doc->appendChild($urlset);
    }

    $addUrl = function ($value) use ($doc, $urlset) {
      foreach ($doc->getElementsByTagName('loc') as $locNode) {
        if ($locNode->nodeValue === $value) {
          return;
        }
      }
      $urlNode = $doc->createElement('url');
      $locNode = $doc->createElement('loc', $value);
      $lastmodNode = $doc->createElement('lastmod', date('Y-m-d'));
      $urlNode->appendChild($locNode);
      $urlNode->appendChild($lastmodNode);
      $urlset->appendChild($urlNode);
    };

    $addUrl($url);
    $addUrl($siteUrl . '/directory/');
    $addUrl($siteUrl . '/captions/');
    foreach (array_keys($directory) as $catSlug) {
      $addUrl($siteUrl . '/directory/' . $catSlug . '/');
    }
    $doc->save($sitemapFile);
  }

  $relativeUrl = '/captions/' . $slug . '/';
  respond_json(['ok' => true, 'url' => $relativeUrl]);
}
$pageCounts = increment_page_counter($view);
$fontAssets = load_local_fonts();
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Scrolling Video Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Roboto:wght@400;700&family=Montserrat:wght@400;600&family=Oswald:wght@400;600&display=swap" rel="stylesheet">
  <?php if (!empty($fontAssets['css'])) : ?>
    <style>
      <?php echo $fontAssets['css']; ?>
    </style>
  <?php endif; ?>
  <link rel="stylesheet" href="assets/styles.css" />
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <div class="logo">SV</div>
      <div>
        <h1>Scrolling Video Generator</h1>
        <p>Platform-ready templates with live preview</p>
      </div>
    </div>
    <?php if ($view === 'video') : ?>
      <button id="exportFrame" class="secondary">Export Preview PNG</button>
    <?php endif; ?>
    <div class="page-counter">
      Views: <?php echo htmlspecialchars((string)($pageCounts['total'] ?? 0), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); ?>
    </div>
  </header>

  <nav class="tabs">
    <a class="tab <?php echo $view === 'home' ? 'active' : ''; ?>" href="?view=home">Home</a>
    <a class="tab <?php echo $view === 'video' ? 'active' : ''; ?>" href="?view=video">Scrolling Video</a>
    <a class="tab <?php echo $view === 'caption' ? 'active' : ''; ?>" href="?view=caption">IG & YouTube Caption Generator</a>
    <a class="tab <?php echo $view === 'experimental' ? 'active' : ''; ?>" href="?view=experimental">Experimental</a>
    <a class="tab <?php echo $view === 'ig-download' ? 'active' : ''; ?>" href="?view=ig-download">IG Reels Downloader</a>
    <a class="tab <?php echo $view === 'yt-download' ? 'active' : ''; ?>" href="?view=yt-download">YouTube Downloader</a>
  </nav>

  <?php if ($view === 'home') : ?>
  <?php
    $posts = load_posts($pdo);
    $directory = [];
    foreach ($posts as $post) {
      $cat = $post['category'] ?? 'General';
      $catSlug = $post['category_slug'] ?? slugify($cat);
      if (!isset($directory[$catSlug])) {
        $directory[$catSlug] = [
          'name' => $cat,
          'count' => 0,
        ];
      }
      $directory[$catSlug]['count']++;
    }
  ?>
  <main class="layout home-layout" data-panel="home">
    <section class="panel">
      <h2>Welcome</h2>
      <p class="note">Choose a tool or explore your generated content.</p>
      <div class="home-links">
        <a class="home-card" href="?view=video">
          <h3>Scrolling Video</h3>
          <p>Create template-ready scrolling videos.</p>
        </a>
        <a class="home-card" href="?view=caption">
          <h3>IG & YouTube Caption Generator</h3>
          <p>Generate captions, profiles, and SEO posts.</p>
        </a>
        <a class="home-card" href="?view=experimental">
          <h3>Experimental</h3>
          <p>Wizard for IG 2026 features.</p>
        </a>
      </div>
    </section>

    <section class="panel">
      <div class="carousel-header">
        <h2>Latest Generated Content</h2>
        <div class="carousel-actions">
          <button class="secondary" id="carouselPrev">Prev</button>
          <button class="secondary" id="carouselNext">Next</button>
        </div>
      </div>
      <div class="carousel" id="contentCarousel">
        <?php if (empty($posts)) : ?>
          <div class="note">No saved captions yet.</div>
        <?php else : ?>
          <?php foreach (array_reverse($posts) as $post) : ?>
            <?php
              $itemTitle = htmlspecialchars($post['title'] ?? 'Caption', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $itemSlug = htmlspecialchars($post['slug'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $itemProfile = htmlspecialchars($post['profile'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $itemCategory = htmlspecialchars($post['category'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $itemDate = htmlspecialchars(($post['date'] ?? '') . ' ' . ($post['time'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $createdAt = htmlspecialchars($post['created_at'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            ?>
            <article class="carousel-card">
              <h3><?php echo $itemTitle; ?></h3>
              <p class="content-meta"><?php echo $itemProfile; ?> | <?php echo $itemCategory; ?></p>
              <p class="content-meta"><?php echo $itemDate; ?> | Saved: <?php echo $createdAt; ?></p>
              <div class="carousel-actions">
                <a class="secondary button-link" href="/captions/<?php echo $itemSlug; ?>/" target="_blank" rel="noreferrer">Open</a>
                <button class="secondary content-copy" data-copy-url="/captions/<?php echo $itemSlug; ?>/">Copy URL</button>
              </div>
            </article>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </section>

    <section class="panel">
      <h2>Directory (Yellow Pages)</h2>
      <div class="directory-grid">
        <?php if (empty($directory)) : ?>
          <div class="note">No categories yet.</div>
        <?php else : ?>
          <?php foreach ($directory as $slug => $cat) : ?>
            <?php
              $catName = htmlspecialchars($cat['name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $catSlug = htmlspecialchars($slug, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            ?>
            <a class="directory-card" href="/directory/<?php echo $catSlug; ?>/" target="_blank" rel="noreferrer">
              <h3><?php echo $catName; ?></h3>
              <p><?php echo $cat['count']; ?> posts</p>
            </a>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </section>

    <section class="panel">
      <h2>Settings (Optional MySQL)</h2>
      <p class="note">Enable MySQL in config.php to auto-create the database and tables on first run.</p>
      <div class="info-box">
        <strong>Steps:</strong>
        <ol>
          <li>Open config.php</li>
          <li>Set mysql.enabled to true</li>
          <li>Fill host, port, user, pass, database</li>
        </ol>
      </div>
      <pre class="code-block">return [
  'mysql' =&gt; [
    'enabled' =&gt; true,
    'host' =&gt; '127.0.0.1',
    'port' =&gt; 3306,
    'user' =&gt; 'root',
    'pass' =&gt; 'password',
    'database' =&gt; 'scrolling_video_generator',
    'charset' =&gt; 'utf8mb4',
  ],
];</pre>
    </section>
  </main>
  <?php endif; ?>

  <?php if ($view === 'video') : ?>
  <main class="layout" data-panel="video">
    <section class="panel">
      <h2>Template</h2>
      <label class="field">
        <span>Screen template</span>
        <select id="templateSelect"></select>
      </label>
      <div class="row">
        <label class="field">
          <span>Template name</span>
          <input type="text" id="templateName" placeholder="e.g., Brand Square" />
        </label>
        <label class="field">
          <span>Secret password</span>
          <input type="password" id="templatePassword" placeholder="Enter password" />
        </label>
        <div class="field">
          <span>Custom template</span>
          <button id="addTemplate" class="secondary">Save Template</button>
        </div>
      </div>
      <div class="row">
        <label class="field">
          <span>Width (px)</span>
          <input type="number" id="widthInput" min="100" max="4000" />
        </label>
        <label class="field">
          <span>Height (px)</span>
          <input type="number" id="heightInput" min="100" max="4000" />
        </label>
      </div>
      <label class="field">
        <span>Background</span>
        <select id="bgMode">
          <option value="color" selected>Custom color</option>
          <option value="white">White</option>
          <option value="transparent">Transparent</option>
          <option value="image">Custom image</option>
        </select>
      </label>
      <label class="field" id="bgColorRow">
        <span>Background color</span>
        <input type="color" id="bgColor" value="#0b0f1a" />
      </label>
      <label class="field" id="bgImageRow" hidden>
        <span>Background image</span>
        <input type="file" id="bgImageInput" accept="image/*" />
      </label>

      <h2>Scrolling Text</h2>
      <label class="field">
        <span>Text content</span>
        <div class="rich-editor" id="textEditor" contenteditable="true" aria-label="Scrolling text editor">
          Your scrolling text goes here
        </div>
        <div class="editor-toolbar" role="toolbar" aria-label="Text formatting">
          <button type="button" class="secondary" data-cmd="bold"><strong>B</strong></button>
          <button type="button" class="secondary" data-cmd="italic"><em>I</em></button>
          <button type="button" class="secondary" data-cmd="underline"><u>U</u></button>
          <button type="button" class="secondary" data-cmd="insertUnorderedList">• List</button>
          <button type="button" class="secondary" data-emoji="✨">✨</button>
          <button type="button" class="secondary" data-emoji="🔥">🔥</button>
          <button type="button" class="secondary" data-emoji="✅">✅</button>
          <button type="button" class="secondary" data-action="copy">Copy</button>
          <button type="button" class="secondary" data-action="paste">Paste</button>
        </div>
      </label>
      <div class="row">
        <label class="field">
          <span>Auto paragraph</span>
          <select id="autoParagraph">
            <option value="off">Off</option>
            <option value="on" selected>On</option>
          </select>
        </label>
        <label class="field">
          <span>Text align</span>
          <select id="textAlign">
            <option value="left">Left</option>
            <option value="center" selected>Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>
      <div class="row">
        <label class="field">
          <span>Font</span>
          <select id="fontSelect">
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Oswald">Oswald</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <?php echo $fontAssets['options']; ?>
          </select>
        </label>
        <label class="field">
          <span>Custom font family</span>
          <input type="text" id="customFont" placeholder="e.g., 'Segoe UI', 'Times New Roman'" />
        </label>
        <label class="field">
          <span>Font size</span>
          <input type="number" id="fontSize" min="12" max="200" value="64" />
        </label>
      </div>
      <div class="row">
        <label class="field">
          <span>Font weight</span>
          <select id="fontWeight">
            <option value="400" selected>Regular</option>
            <option value="600">Semi Bold</option>
            <option value="700">Bold</option>
          </select>
        </label>
        <label class="field">
          <span>Font style</span>
          <select id="fontStyle">
            <option value="normal" selected>Normal</option>
            <option value="italic">Italic</option>
          </select>
        </label>
      </div>
      <div class="row">
        <label class="field">
          <span>Text color</span>
          <input type="color" id="textColor" value="#ffffff" />
        </label>
        <label class="field">
          <span>Line spacing</span>
          <input type="number" id="lineSpacing" min="1" max="200" value="12" />
        </label>
      </div>
      <div class="row">
        <label class="field">
          <span>Offset X</span>
          <input type="number" id="offsetX" value="0" />
        </label>
        <label class="field">
          <span>Offset Y</span>
          <input type="number" id="offsetY" value="0" />
        </label>
      </div>
      <label class="field">
        <span>Direction</span>
        <select id="directionSelect">
          <option value="ltr">Left to right</option>
          <option value="rtl" selected>Right to left</option>
          <option value="ttb">Top to bottom</option>
          <option value="btt">Bottom to top</option>
        </select>
      </label>
      <label class="field">
        <span>Speed (px/sec)</span>
        <input type="range" id="speed" min="20" max="400" value="120" />
      </label>
      <div id="warning" class="warning" hidden>Text may be clipped in the current template.</div>
      <div class="row">
        <label class="field">
          <span>Video duration (sec)</span>
          <input type="number" id="videoDuration" min="1" max="600" value="5" />
        </label>
        <label class="field">
          <span>Format</span>
          <select id="videoFormat">
            <option value="webm" selected>WebM</option>
            <option value="mpg">MPG</option>
            <option value="avi">AVI</option>
          </select>
        </label>
      </div>
      <button id="downloadVideo">Download Video</button>
      <div class="field">
        <span>Download progress</span>
        <progress id="videoProgress" max="100" value="0"></progress>
      </div>

      <h2>QR Code</h2>
      <label class="field">
        <span>URL</span>
        <input type="url" id="qrUrl" placeholder="https://example.com" />
      </label>
      <div class="row">
        <label class="field">
          <span>QR size (px)</span>
          <input type="number" id="qrSize" min="60" max="600" value="160" />
        </label>
        <label class="field">
          <span>QR X</span>
          <input type="number" id="qrX" value="40" />
        </label>
        <label class="field">
          <span>QR Y</span>
          <input type="number" id="qrY" value="40" />
        </label>
      </div>
      <div class="row">
        <button id="generateQr">Generate QR</button>
        <button id="downloadQrPng" class="secondary">Download PNG</button>
        <button id="downloadQrSvg" class="secondary">Download SVG</button>
      </div>
    </section>

    <section class="preview">
      <div class="preview-header">
        <h2>Live Preview</h2>
        <div class="preview-actions">
          <div class="template-meta" id="templateMeta"></div>
          <button id="refreshPreview" class="secondary" type="button">Refresh Preview</button>
        </div>
      </div>
      <div class="canvas-wrap">
        <canvas id="previewCanvas"></canvas>
      </div>
      <div class="note">
        Preview scales to fit this panel. Export uses the full template resolution.
      </div>
    </section>
  </main>
  <?php endif; ?>

  <?php if ($view === 'caption') : ?>
  <main class="layout caption-layout" data-panel="caption">
    <section class="panel">
      <h2>Profiles</h2>
      <label class="field">
        <span>Profile</span>
        <select id="captionProfileSelect"></select>
      </label>
      <div class="row">
        <label class="field">
          <span>Profile name</span>
          <input type="text" id="captionProfileName" placeholder="e.g., MyBrand" />
        </label>
        <label class="field">
          <span>Handle</span>
          <input type="text" id="captionProfileHandle" placeholder="@mybrand" />
        </label>
      </div>
      <div class="row">
        <label class="field">
          <span>Platform</span>
          <select id="captionProfilePlatform">
            <option value="Instagram">Instagram</option>
            <option value="YouTube">YouTube</option>
          </select>
        </label>
        <div class="field">
          <span>Add profile</span>
          <button id="captionAddProfile" class="secondary">Save Profile</button>
        </div>
      </div>

      <h2>Templates</h2>
      <label class="field">
        <span>Template</span>
        <select id="captionTemplateSelect"></select>
      </label>
      <div class="row">
        <label class="field">
          <span>Template name</span>
          <input type="text" id="captionTemplateName" placeholder="e.g., Launch Caption" />
        </label>
        <label class="field">
          <span>Days offset (+/-)</span>
          <input type="text" id="captionDaysOffset" value="0" />
        </label>
      </div>
      <label class="field">
        <span>Template body (supports {profile}, {handle}, {platform}, {date}, {day}, {time}, {custom}, {hashtags})</span>
        <textarea id="captionTemplateBody" rows="5">{custom}\n\n{hashtags}</textarea>
      </label>
      <label class="field">
        <span>Hashtags</span>
        <textarea id="captionHashtags" rows="3">#brand #launch</textarea>
      </label>
      <button id="captionSaveTemplate" class="secondary">Save Template</button>

      <h2>Post Settings</h2>
      <div class="row">
        <label class="field">
          <span>Date</span>
          <input type="date" id="captionDate" />
        </label>
        <label class="field">
          <span>Category</span>
          <input type="text" id="captionCategory" placeholder="e.g., Fitness, Beauty" />
        </label>
        <label class="field">
          <span>Day</span>
          <select id="captionDay">
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
            <option>Sunday</option>
          </select>
        </label>
        <label class="field">
          <span>Time</span>
          <input type="time" id="captionTime" />
        </label>
      </div>
      <label class="field">
        <span>Custom text (unicode / emoji supported)</span>
        <textarea id="captionCustomText" rows="5">✨ New drop coming soon!</textarea>
      </label>
      <div class="row">
        <button id="captionCustomCopy" class="secondary">Copy custom text</button>
        <button id="captionCustomPaste" class="secondary">Paste to custom text</button>
      </div>
      <div class="row">
        <label class="field checkbox">
          <input type="checkbox" id="captionScrollToggle" />
          <span>Add scrolling CTA</span>
        </label>
        <label class="field">
          <span>CTA text</span>
          <input type="text" id="captionScrollText" value="⬇️ Scroll for more" />
        </label>
      </div>
      <div class="row">
        <label class="field">
          <span>SEO title</span>
          <input type="text" id="captionTitle" placeholder="Optional title for the generated page" />
        </label>
        <label class="field">
          <span>Site URL (for sitemap)</span>
          <input type="url" id="captionSiteUrl" placeholder="https://your-domain.com" />
        </label>
      </div>
      <div class="row">
        <button id="captionGenerate">Generate Caption</button>
        <button id="captionCopy" class="secondary">Copy Caption</button>
        <button id="captionSavePost" class="secondary">Save Post</button>
      </div>
      <div id="captionSaveResult" class="note" hidden></div>
    </section>

    <section class="preview">
      <div class="preview-header">
        <h2>Caption Preview</h2>
        <div class="template-meta" id="captionPreviewMeta">Ready</div>
      </div>
      <div class="caption-preview">
        <pre id="captionOutput"></pre>
      </div>
      <div class="row">
        <button id="captionOutputCopy" class="secondary">Copy generated caption</button>
        <button id="captionOutputPaste" class="secondary">Paste into custom text</button>
      </div>
      <div class="note">
        Text wraps automatically, supports unicode and emoji.
      </div>
    </section>
  </main>
  <?php
    $posts = load_posts($pdo);
  ?>
  <main class="layout caption-layout" data-panel="caption">
    <section class="panel">
      <h2>Generated Content</h2>
      <p class="note">Latest saved captions with timestamps. Click to open or copy.</p>
      <div class="content-list">
        <?php if (empty($posts)) : ?>
          <div class="note">No saved captions yet.</div>
        <?php else : ?>
          <?php foreach (array_reverse($posts) as $post) : ?>
            <?php
              $itemTitle = htmlspecialchars($post['title'] ?? 'Caption', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $itemSlug = htmlspecialchars($post['slug'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $itemProfile = htmlspecialchars($post['profile'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $itemCategory = htmlspecialchars($post['category'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $itemCategorySlug = htmlspecialchars($post['category_slug'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $itemDate = htmlspecialchars(($post['date'] ?? '') . ' ' . ($post['time'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
              $createdAt = htmlspecialchars($post['created_at'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            ?>
            <div class="content-item">
              <div>
                <a class="content-link" href="/captions/<?php echo $itemSlug; ?>/" target="_blank" rel="noreferrer"><?php echo $itemTitle; ?></a>
                <div class="content-meta">
                  <?php echo $itemProfile; ?>
                  <?php if ($itemCategory) : ?>
                    | <a class="content-tag" href="/directory/<?php echo $itemCategorySlug; ?>/" target="_blank" rel="noreferrer"><?php echo $itemCategory; ?></a>
                  <?php endif; ?>
                  | <?php echo $itemDate; ?> | Saved: <?php echo $createdAt; ?>
                </div>
                <div class="content-url">/captions/<?php echo $itemSlug; ?>/</div>
              </div>
              <button class="secondary content-copy" data-copy-url="/captions/<?php echo $itemSlug; ?>/">Copy URL</button>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </section>
  </main>
  <?php endif; ?>

  <?php if ($view === 'experimental') : ?>
  <main class="layout experimental-layout" data-panel="experimental">
    <section class="panel">
      <div class="wizard">
        <aside class="wizard-nav">
          <h2>Experimental Wizard</h2>
          <p class="note">Configure IG 2026 features step-by-step. Save presets as you go.</p>
          <ol class="wizard-steps">
            <li class="wizard-step active" data-step="1">1. Reels Scheduler</li>
            <li class="wizard-step" data-step="2">2. Trends + Audio</li>
            <li class="wizard-step" data-step="3">3. Brand Kit</li>
            <li class="wizard-step" data-step="4">4. Multi-Language + A/B</li>
            <li class="wizard-step" data-step="5">5. Auto CTA + Links</li>
            <li class="wizard-step" data-step="6">6. Client Deliverables</li>
            <li class="wizard-step" data-step="7">7. Analytics Tags</li>
            <li class="wizard-step" data-step="8">8. Marketplace</li>
            <li class="wizard-step" data-step="9">9. Batch Queue</li>
          </ol>
        </aside>

        <section class="wizard-body">
          <div class="wizard-progress">
            <div class="wizard-progress-bar" id="wizardProgress"></div>
          </div>

          <div class="wizard-step-content" data-step="1">
            <h3>IG 2026 Reels Scheduler</h3>
            <p>Auto-captions, hook scoring, and best-time recommendations.</p>
            <div class="row">
              <label class="field">
                <span>Timezone</span>
                <select id="expTimezone">
                  <option>UTC</option>
                  <option>Asia/Kolkata</option>
                  <option>Europe/London</option>
                  <option>America/New_York</option>
                </select>
              </label>
              <label class="field">
                <span>Preferred posting days</span>
                <input type="text" id="expDays" placeholder="Mon, Wed, Fri" />
              </label>
            </div>
            <div class="row">
              <label class="field">
                <span>Schedule date</span>
                <input type="date" id="expScheduleDate" />
              </label>
              <label class="field">
                <span>Schedule time</span>
                <input type="time" id="expScheduleTime" />
              </label>
            </div>
            <label class="field">
              <span>Hook scoring style</span>
              <select id="expHookStyle">
                <option>Engagement-first</option>
                <option>Retention-first</option>
                <option>Sales-first</option>
              </select>
            </label>
            <label class="field">
              <span>Hook text (first 3 seconds)</span>
              <textarea id="expHookText" rows="3" placeholder="Stop scrolling—here’s the 1 trick..."></textarea>
            </label>
            <div class="row">
              <button id="expScoreHook" class="secondary">Score Hook</button>
              <div class="field">
                <span>Hook score</span>
                <div class="score-pill" id="expHookScore">—</div>
              </div>
            </div>
            <div class="row">
              <label class="field">
                <span>Best time recommendation</span>
                <select id="expBestTime"></select>
              </label>
              <button id="expApplyBestTime" class="secondary">Apply to schedule</button>
            </div>
            <label class="field checkbox">
              <input type="checkbox" id="expAutoCaptions" checked />
              <span>Enable auto-captions for Reels</span>
            </label>
            <div class="info-box" id="expScheduleSummary">Set a date to see recommendations.</div>
          </div>

          <div class="wizard-step-content" data-step="2" hidden>
            <h3>Trend-Aware Hashtags + Audio</h3>
            <p>Suggestions filtered by region and language.</p>
            <div class="row">
              <label class="field">
                <span>Region</span>
                <select id="expRegion">
                  <option>Global</option>
                  <option>India</option>
                  <option>USA</option>
                  <option>UK</option>
                </select>
              </label>
              <label class="field">
                <span>Language</span>
                <select id="expLanguage">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </label>
            </div>
            <label class="field">
              <span>Niche</span>
              <input type="text" id="expNiche" placeholder="fitness, fashion, food" />
            </label>
            <div class="info-box">Suggestions will populate after niche selection.</div>
          </div>

          <div class="wizard-step-content" data-step="3" hidden>
            <h3>Creator Brand Kit</h3>
            <p>Keep fonts, colors, and safe margins consistent.</p>
            <div class="row">
              <label class="field">
                <span>Primary color</span>
                <input type="color" id="expPrimaryColor" value="#dd2a7b" />
              </label>
              <label class="field">
                <span>Secondary color</span>
                <input type="color" id="expSecondaryColor" value="#8134af" />
              </label>
            </div>
            <label class="field">
              <span>Brand font</span>
              <input type="text" id="expBrandFont" placeholder="Inter, Montserrat" />
            </label>
            <label class="field checkbox">
              <input type="checkbox" id="expSafeMargins" checked />
              <span>Enable safe margin overlay</span>
            </label>
          </div>

          <div class="wizard-step-content" data-step="4" hidden>
            <h3>Multi-Language + A/B Testing</h3>
            <p>Create variants and export packs.</p>
            <label class="field">
              <span>Languages</span>
              <input type="text" id="expLanguages" placeholder="English, Hindi, Spanish" />
            </label>
            <label class="field">
              <span>A/B Variant count</span>
              <input type="number" id="expVariantCount" min="2" max="6" value="2" />
            </label>
            <label class="field checkbox">
              <input type="checkbox" id="expPackExport" checked />
              <span>Generate A/B export pack</span>
            </label>
          </div>

          <div class="wizard-step-content" data-step="5" hidden>
            <h3>Auto CTA + Trackable Links</h3>
            <p>DM keywords, link-in-bio prompts, and UTMs.</p>
            <label class="field">
              <span>DM Keyword</span>
              <input type="text" id="expDmKeyword" placeholder="DM 'START'" />
            </label>
            <label class="field">
              <span>Link-in-bio prompt</span>
              <input type="text" id="expBioPrompt" placeholder="Tap the link in bio" />
            </label>
            <label class="field">
              <span>UTM Campaign</span>
              <input type="text" id="expUtmCampaign" placeholder="ig_reels_launch" />
            </label>
          </div>

          <div class="wizard-step-content" data-step="6" hidden>
            <h3>Client Deliverables</h3>
            <p>Shareable previews, approvals, and watermarking.</p>
            <label class="field checkbox">
              <input type="checkbox" id="expPreviewLinks" checked />
              <span>Generate shareable preview links</span>
            </label>
            <label class="field checkbox">
              <input type="checkbox" id="expApprovals" checked />
              <span>Enable approval workflow</span>
            </label>
            <label class="field">
              <span>Watermark text</span>
              <input type="text" id="expWatermark" placeholder="Client Preview" />
            </label>
          </div>

          <div class="wizard-step-content" data-step="7" hidden>
            <h3>Analytics-Ready Export Tags</h3>
            <p>UTM presets and campaign IDs.</p>
            <label class="field">
              <span>Campaign ID prefix</span>
              <input type="text" id="expCampaignId" placeholder="CMP-2026" />
            </label>
            <label class="field checkbox">
              <input type="checkbox" id="expEmbedMetadata" checked />
              <span>Embed metadata into exports</span>
            </label>
          </div>

          <div class="wizard-step-content" data-step="8" hidden>
            <h3>Template Marketplace</h3>
            <p>Paid presets and niche creator packs.</p>
            <label class="field">
              <span>Marketplace category focus</span>
              <input type="text" id="expMarketplace" placeholder="fitness, beauty, education" />
            </label>
            <label class="field checkbox">
              <input type="checkbox" id="expMarketplaceEnabled" />
              <span>Enable marketplace publishing</span>
            </label>
          </div>

          <div class="wizard-step-content" data-step="9" hidden>
            <h3>Batch Queue for Agencies</h3>
            <p>Bulk caption and render queue management.</p>
            <label class="field">
              <span>Queue priority</span>
              <select id="expQueuePriority">
                <option>Standard</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </label>
            <label class="field">
              <span>CSV import source</span>
              <input type="text" id="expCsvSource" placeholder="Upload path or URL" />
            </label>
            <label class="field checkbox">
              <input type="checkbox" id="expTeamRoles" checked />
              <span>Enable team roles and approvals</span>
            </label>
          </div>

          <div class="wizard-actions">
            <button id="wizardPrev" class="secondary">Back</button>
            <button id="wizardNext">Next</button>
          </div>
        </section>
      </div>
    </section>
  </main>
  <?php endif; ?>

  <?php if ($view === 'ig-download') : ?>
  <main class="layout downloader-layout" data-panel="ig-download">
    <section class="panel">
      <h2>Instagram Reels Downloader</h2>
      <p class="note">For your own content only. Instagram does not allow direct downloads in-browser without official APIs.</p>
      <label class="field">
        <span>Paste IG Reels link</span>
        <input type="url" id="igReelUrl" placeholder="https://www.instagram.com/reel/..." />
      </label>
      <div class="row">
        <button id="igDownload" class="secondary">Download (Requires API)</button>
        <button id="igCopyLink">Copy Link</button>
      </div>
      <div class="info-box" id="igDownloadStatus">Provide a link to get started.</div>
    </section>
  </main>
  <?php endif; ?>

  <?php if ($view === 'yt-download') : ?>
  <main class="layout downloader-layout" data-panel="yt-download">
    <section class="panel">
      <h2>YouTube Shorts & Video Downloader</h2>
      <p class="note">For your own content only. Use official YouTube APIs or downloads enabled by the creator.</p>
      <label class="field">
        <span>Paste YouTube link</span>
        <input type="url" id="ytUrl" placeholder="https://www.youtube.com/watch?v=..." />
      </label>
      <div class="row">
        <button id="ytDownload" class="secondary">Download (Requires API)</button>
        <button id="ytCopyLink">Copy Link</button>
      </div>
      <div class="info-box" id="ytDownloadStatus">Provide a link to get started.</div>
    </section>
  </main>
  <?php endif; ?>

  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <script src="assets/app.js"></script>
</body>
</html>
