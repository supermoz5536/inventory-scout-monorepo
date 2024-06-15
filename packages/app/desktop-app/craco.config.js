// このコードは、component-sharedディレクトリ内のファイルも
// Babelローダーで処理されるようにすることで、
// 複数のReactアプリケーション間でコードを共有できるように
// Webpackの設定をカスタマイズしています。

// 具体的には、WebpackのBabelローダーのincludeプロパティに
// component-sharedディレクトリを追加することで、
// Babelローダーがこのディレクトリ内のファイルもトランスパイルするようになります。

// Node.jsの組み込みモジュールで、
// ファイルやディレクトリのパスを操作するために使用されます。
const path = require("path");

// @craco/cracoからインポートされる関数で、
// Webpackのローダーを取得するために使用されます。
// ローダーの概念は、トランスパイラを含みます。
const { getLoader, loaderByName } = require("@craco/craco");

// 複数のReactアプリケーション間で
// コンポーネントを共有するために共有ディレクトリの指定をします。

// babel-loader（トランスパイラ）が
// component-shared 内のファイルも処理するように設定しています。

// packages配列に、component-sharedのパスを格納します。
// ../で → app → packages と2つ上の階層に登り、
// そこ/component-sharedのパスを結合します。
const packages = [];
packages.push(path.join(__dirname, "../../component-shared"));

// module.exportsは、
// 他のファイルがこの設定をインポートできるように
// エクスポートしています。
module.exports = {
  // webpackオブジェクトのconfigureプロパティは、
  // Webpackの設定をカスタマイズするための関数です。
  webpack: {
    // getLoaderを使って、
    // Webpackの設定（webpackConfig）からBabelローダーを探します。
    configure: (webpackConfig, arg) => {
      const { isFound, match } = getLoader(
        webpackConfig,
        loaderByName("babel-loader")
      );
      // isFoundがtrueの場合、
      // Babelローダーのincludeプロパティに、
      // component-sharedディレクトリを追加します。
      if (isFound) {
        // includeプロパティは、
        // Babelローダーが処理するファイルを指定するためのものです。
        // Array.isArray(match.loader.include)は、
        // includeが配列かどうかをチェックします。
        // もし配列でなければ、includeを配列に変換します。
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include];

        // 最後に、include配列にpackages配列を追加します。
        match.loader.include = include.concat(packages);
      }
      return webpackConfig;
    },
  },
};
