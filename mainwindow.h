#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QApplication>
#include <QDebug>
#include <QList>
#include <QVector>
#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QJsonValue>
#include <QRandomGenerator>
#include <QFileDialog>
#include <QCoreApplication>
#include <QProcess>
#include <QVBoxLayout>
#include <QPushButton>
#include <QTextEdit>
#include <QLineEdit>
#include <QLabel>
#include <QMap>

#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>

#include <iostream>
#include <iomanip>
#include <sstream>
#include <fstream>
#include <cmath>

using namespace std;

typedef struct note_struct{
    int type;//1:clock,2:hold,3:flick,4:drag
    bool real;
    float x;
    int startS;
    double startMS;
    int endS;
    double endMS;
    int alpha;
}note_t;

typedef struct pattern_struct{
    int noteType; //the note type of the last note.
    int val; //max volume value.
    int endI;     //end time in terms of pixel
    bool verti;//whether ended on vertical lines or not.
    float vertiX;//verti line x
    float horiX;//hori line x
    int vertiDir;
    int horiDir;
    float vertiNoteX;//end note x, different from line x if was not moving.
    float horiNoteX;
    bool followHold;//the x of hold and clicks are recorded differently, and the drags close to previous notes need to follow the previous note's location.
}pattern_t;

typedef struct moveX_struct{
    float startX;
    float endX;
    int startS;
    double startMS;
    int endS;
    double endMS;
}moveX_t;

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void selectVideo();
    void selectOutPath();
    void selectAudio();
    void defaultAudio();
    void selectImage();
    void defaultImage();
    void Chinese();
    void English();
    void bw();
    void grey();

    void runProcess(QString program, QStringList arguments);
    void onProcessOutput();

    void onProcessFinished(int exitCode, QProcess::ExitStatus exitStatus);

signals:
    void updateOutput(const QString& text);
    void processDone(const QString& program);

private:
    QProcess *process;

    Ui::MainWindow *ui;
    QPushButton *selectVideoButton;
    QPushButton *selectAudioButton;
    QPushButton *defaultAudioButton;
    QPushButton *selectImageButton;
    QPushButton *defaultImageButton;
    QPushButton *selectOutPathButton;
    QPushButton *exportButton;
    QPushButton *bwButton;
    QPushButton *greyButton;

    QLineEdit *nameLine;
    QLineEdit *charterLine;
    QLineEdit *composerLine;
    QLineEdit *levelLine;

    QLineEdit *colorThresholdLine;
    QLineEdit *fpsMaxLine;
    QLineEdit *fallSpeedLine;
    QLineEdit *offsetLine;
    QLineEdit *noteIntervalLine;
    QLineEdit *clickIntervalLine;
    QLineEdit *holdIntervalLine;
    QLineEdit *holdTimeLine;
    QLineEdit *vDiffLine;

    QTextEdit *outputTextEdit;

    QWidget *centralWidget;

    QString buttonStyle;
    QString unselectedStyle;
    QString selectedStyle;

    QString videoPath;
    QString audioPath;
    QString imagePath;
    QString exportPath;

    QString charter="Unknown";
    QString composer="Unknown";
    QString name="Unknown";
    QString level="SP Lv.?";

    bool useDefaultAudio=true;
    bool useDefaultImage=true;

    string readAll(string filename);
    string lineToStr(int y, int group, string name);
    string noteToStr(note_t n);
    string moveXToStr(moveX_t m,bool reverse);
    void parseVideo();
    void exportNew();
    void parseAudio();
    pattern_t pattern(int maxI, int minI, int val, pattern_t prevP);
    void writeChart();
    void getImage();
    void disableAll(QWidget *w, bool disable);
    double getNum(QLineEdit *l,double defaultVal,double min, double max);
    QStringList getTextArray(const QString &filePath);

    QList<note_t> fakeLines[57];
    QList<note_t> fixedVertiLine;
    QList<note_t> fixedHoriLine;
    QList<note_t> movingVertiLine;
    QList<note_t> movingHoriLine;
    QList<moveX_t> moveXVerti;
    QList<moveX_t> moveXHori;

    float vertiMax=211.36f;
    float horiOuterMax=590.63f;
    float horiInnerMax=421.88f;
    int pixelPerSec=512;
    double msPerPixel = 1000.0/double(pixelPerSec);

    int holdTime=pixelPerSec*0.5;//if duration longer than holdTime, fill it with a hold or continuous drags.
    int clickInterval=pixelPerSec*0.25;//if the interval following a click is shorter than this, should not initiate a click or hold.
    int holdInterval=pixelPerSec*0.5;//if the interval following a hold/drag/flick is shorter than this, should not initiate a click or hold.
    int dragInterval=pixelPerSec*0.1;//the fixed interval between two drags during a period of continuous drags.
    int noteInterval=pixelPerSec*0.2;//continue without adding notes if interval between two notes is shorter than this.
    int offset = pixelPerSec*2;//begin without any real notes.
    float fallSpeed=0.25;

    float xInc=50;
    float vDiff=3;//define a beat as a local max where (max>vDiff*min0 && max>vDiff*min1).
    //int volumeThreshold=1000;//min valid value for a note.

    double fpsMax = 10;
    bool allowGrey=true;
    int colorThreshold=5;//only add/delete/replace fake notes if color change is larger than this.


    int totalFakeNotes=0;//for debug display only.
    int totalRealNotes=0;//for debug display only.
    int totalNoteTypes[4];//for debug display only.

    QStringList text;
    QString language="Chinese.txt";
    QLabel *l7;
    QLabel *l8;
    QLabel *l9;
    QLabel *l10;
    QLabel *l13;
    QLabel *l14;
    QLabel *l15;
    QLabel *l16;
    QLabel *l17;
    QLabel *l18;
    QLabel *l19;
    QLabel *l20;
    QLabel *l21;
    QLabel *l22;
    QPushButton *ChineseButton;
    QPushButton *EnglishButton;
    void updateText();

};
#endif // MAINWINDOW_H
