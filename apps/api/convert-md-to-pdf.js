#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function convertMarkdownToPdf(inputDir) {
  // Check if pandoc is installed
  try {
    execSync('pandoc --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: pandoc is not installed. Please install pandoc first.');
    console.error('Install with: brew install pandoc (macOS) or visit https://pandoc.org/installing.html');
    process.exit(1);
  }

  // Get input directory from command line argument or use current directory
  const sourceDir = inputDir || process.cwd();

  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Directory "${sourceDir}" does not exist.`);
    process.exit(1);
  }

  // Create pdf output directory
  const pdfDir = path.join(sourceDir, 'pdf');
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
    console.log(`Created directory: ${pdfDir}`);
  }

  // Find all markdown files and sort them naturally (handles numbers correctly)
  const markdownFiles = fs.readdirSync(sourceDir)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.md' || ext === '.markdown';
    })
    .sort((a, b) => {
      // Natural sort to handle numbered files like 1.md, 2.md, 10.md correctly
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

  if (markdownFiles.length === 0) {
    console.log('No markdown files found in the directory.');
    return;
  }

  console.log(`Found ${markdownFiles.length} markdown file(s). Merging into single PDF...`);
  console.log('File order:', markdownFiles);

  try {
    // Create a combined markdown file
    const combinedMdPath = path.join(pdfDir, 'combined.md');
    let combinedContent = '';

    console.log('Combining markdown files...');
    markdownFiles.forEach((file, index) => {
      const inputPath = path.join(sourceDir, file);
      const content = fs.readFileSync(inputPath, 'utf8');

      console.log(`Adding: ${file}`);

      // Add page break between files (except for the first one)
      if (index > 0) {
        combinedContent += '\n\\newpage\n\n';
      }

      // Add file title as heading
      const fileName = path.parse(file).name;
      combinedContent += `# ${fileName}\n\n`;

      // Add content
      combinedContent += content + '\n\n';
    });

    // Write combined markdown
    fs.writeFileSync(combinedMdPath, combinedContent, 'utf8');

    // Generate output PDF name based on directory name
    const dirName = path.basename(sourceDir);
    const outputPath = path.join(pdfDir, `${dirName}-合并版.pdf`);

    console.log(`Converting to PDF: ${path.basename(outputPath)}`);

    // Convert the combined markdown to PDF
    let conversionSuccess = false;

    // First try to convert using browser-based method (Chrome/Chromium)
    try {
      // Check if we have Chrome or Chromium available
      let browserPath = null;
      const browsers = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        'google-chrome',
        'chromium'
      ];

      for (const browser of browsers) {
        try {
          if (browser.startsWith('/')) {
            if (fs.existsSync(browser)) {
              browserPath = browser;
              break;
            }
          } else {
            execSync(`which ${browser}`, { stdio: 'ignore' });
            browserPath = browser;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (browserPath) {
        // Convert markdown to HTML first
        const htmlPath = path.join(pdfDir, 'combined.html');
        execSync(`pandoc "${combinedMdPath}" -o "${htmlPath}" --standalone --self-contained`, {
          stdio: 'pipe'
        });

        // Convert HTML to PDF using headless Chrome
        const absoluteHtmlPath = path.resolve(htmlPath);
        const absoluteOutputPath = path.resolve(outputPath);

        const chromeCmd = `"${browserPath}" --headless --disable-gpu --print-to-pdf="${absoluteOutputPath}" --print-to-pdf-no-header --no-margins "file://${absoluteHtmlPath}"`;

        execSync(chromeCmd, {
          stdio: 'pipe'
        });

        // Clean up temporary files
        fs.unlinkSync(htmlPath);
        fs.unlinkSync(combinedMdPath);
        conversionSuccess = true;
      }
    } catch (browserError) {
      console.log('Browser conversion failed, trying LaTeX...');
    }

    // If browser method failed, try LaTeX engines
    if (!conversionSuccess) {
      const pdfEngines = ['pdflatex', 'xelatex'];

      for (const engine of pdfEngines) {
        try {
          execSync(`which ${engine}`, { stdio: 'ignore' });
          execSync(`pandoc "${combinedMdPath}" -o "${outputPath}" --pdf-engine=${engine} -V geometry:margin=1in`, {
            stdio: 'pipe'
          });
          fs.unlinkSync(combinedMdPath);
          conversionSuccess = true;
          break;
        } catch (engineError) {
          continue;
        }
      }
    }

    if (!conversionSuccess) {
      throw new Error('No suitable PDF conversion method found. Please install Google Chrome or a LaTeX distribution (pdflatex/xelatex)');
    }

    console.log(`\nConversion complete!`);
    console.log(`Combined PDF created: ${outputPath}`);
    console.log(`Total files merged: ${markdownFiles.length}`);

  } catch (error) {
    console.error(`Failed to create combined PDF:`, error.message);
  }
}

// Get directory from command line argument
const inputDir = process.argv[2];

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node convert-md-to-pdf.js [directory]');
  console.log('');
  console.log('Converts all markdown files in the specified directory to PDF.');
  console.log('If no directory is specified, uses the current directory.');
  console.log('PDF files will be saved in a "pdf" subfolder.');
  console.log('');
  console.log('Requirements: pandoc must be installed');
  console.log('Install pandoc: brew install pandoc (macOS)');
  process.exit(0);
}

convertMarkdownToPdf(inputDir);