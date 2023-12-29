#include "mainwindow.h"
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    setWindowTitle("PhiGen");
    centralWidget = new QWidget(this);
    QVBoxLayout *mainLayout = new QVBoxLayout(centralWidget);

    text = getTextArray(language);

    selectVideoButton = new QPushButton(text[0],this);
    selectOutPathButton = new QPushButton(text[1],this);
    exportButton = new QPushButton(text[2],this);
    selectAudioButton = new QPushButton(text[3],this);
    defaultAudioButton = new QPushButton(text[4],this);
    defaultAudioButton->setFixedWidth(320);
    selectImageButton = new QPushButton(text[5],this);
    defaultImageButton = new QPushButton(text[6],this);
    defaultImageButton->setFixedWidth(320);

    outputTextEdit = new QTextEdit(this);
    outputTextEdit->setReadOnly(true);
    QTextCursor cursor(outputTextEdit->textCursor());
    QTextCharFormat format;
    format.setForeground(Qt::white);
    cursor.mergeCharFormat(format);
    outputTextEdit->setTextCursor(cursor);

    mainLayout->addWidget(outputTextEdit);

    nameLine = new QLineEdit;
    nameLine->setText(name);
    nameLine->setStyleSheet("color:white");
    composerLine = new QLineEdit;
    composerLine->setText(composer);
    composerLine->setStyleSheet("color:white");
    charterLine = new QLineEdit;
    charterLine->setText(charter);
    charterLine->setStyleSheet("color:white");
    levelLine=new QLineEdit;
    levelLine->setText(level);
    levelLine->setStyleSheet("color:white");

    QHBoxLayout *lineLayout = new QHBoxLayout();
    lineLayout->addWidget(selectAudioButton);
    lineLayout->addWidget(defaultAudioButton);
    mainLayout->addLayout(lineLayout);

    lineLayout = new QHBoxLayout();
    lineLayout->addWidget(selectImageButton);
    lineLayout->addWidget(defaultImageButton);
    mainLayout->addLayout(lineLayout);

    QWidget *metaWidget=new QWidget(this);
    l7=new QLabel(text[7]);
    l8=new QLabel(text[8]);
    l9=new QLabel(text[9]);
    l10=new QLabel(text[10]);
    l13=new QLabel(text[13]);
    l14=new QLabel(text[14]);
    l15=new QLabel(text[15]);
    l16=new QLabel(text[16]);
    l17=new QLabel(text[17]);
    l18=new QLabel(text[18]);
    l19=new QLabel(text[19]);
    l20=new QLabel(text[20]);
    l21=new QLabel(text[21]);
    l22=new QLabel(text[22]);
    metaWidget->setStyleSheet("color:white");
    lineLayout = new QHBoxLayout();
    QVBoxLayout *colLayout = new QVBoxLayout();
    colLayout->addWidget(l7);
    colLayout->addWidget(l8);
    colLayout->addWidget(l9);
    colLayout->addWidget(l10);
    lineLayout->addLayout(colLayout);
    colLayout = new QVBoxLayout();
    colLayout->addWidget(nameLine);
    colLayout->addWidget(composerLine);
    colLayout->addWidget(charterLine);
    colLayout->addWidget(levelLine);
    lineLayout->addLayout(colLayout);
    metaWidget->setLayout(lineLayout);

    QWidget *graphicsWidget=new QWidget(this);
    graphicsWidget->setStyleSheet("color:white");
    colLayout = new QVBoxLayout();
    lineLayout = new QHBoxLayout();
    EnglishButton = new QPushButton("English");
    ChineseButton = new QPushButton("中文");
    bwButton = new QPushButton(text[11]);
    greyButton = new QPushButton(text[12]);
    fpsMaxLine= new QLineEdit(QString::number(fpsMax));
    fpsMaxLine->setFixedWidth(30);
    fpsMaxLine->setMaxLength(2);
    colorThresholdLine= new QLineEdit(QString::number(colorThreshold));
    colorThresholdLine->setFixedWidth(40);
    colorThresholdLine->setMaxLength(3);
    lineLayout -> addWidget(EnglishButton);
    lineLayout -> addWidget(ChineseButton);
    colLayout->addLayout(lineLayout);
    lineLayout=new QHBoxLayout();
    lineLayout -> addWidget(bwButton);
    lineLayout -> addWidget(greyButton);
    colLayout->addLayout(lineLayout);
    lineLayout=new QHBoxLayout();
    lineLayout -> addWidget(l13);
    lineLayout -> addWidget(fpsMaxLine);
    lineLayout -> addWidget(l14);
    lineLayout -> addWidget(colorThresholdLine);
    colLayout->addLayout(lineLayout);
    graphicsWidget->setLayout(colLayout);
    graphicsWidget->setFixedWidth(320);

    lineLayout = new QHBoxLayout();
    lineLayout->addWidget(metaWidget);
    lineLayout->addWidget(graphicsWidget);
    mainLayout->addLayout(lineLayout);

    fallSpeedLine=new QLineEdit(QString::number(fallSpeed));
    fallSpeedLine->setFixedWidth(55);
    fallSpeedLine->setMaxLength(4);
    offsetLine=new QLineEdit(QString::number((double)offset/pixelPerSec));
    offsetLine->setFixedWidth(55);
    offsetLine->setMaxLength(4);
    noteIntervalLine=new QLineEdit(QString::number((double)noteInterval/pixelPerSec));;
    noteIntervalLine->setFixedWidth(55);
    noteIntervalLine->setMaxLength(4);
    clickIntervalLine=new QLineEdit(QString::number((double)clickInterval/pixelPerSec));;
    clickIntervalLine->setFixedWidth(55);
    clickIntervalLine->setMaxLength(4);
    holdIntervalLine=new QLineEdit(QString::number((double)holdInterval/pixelPerSec));;
    holdIntervalLine->setFixedWidth(55);
    holdIntervalLine->setMaxLength(4);
    holdTimeLine=new QLineEdit(QString::number((double)holdTime/pixelPerSec));;
    holdTimeLine->setFixedWidth(55);
    holdTimeLine->setMaxLength(4);
    vDiffLine=new QLineEdit(QString::number(vDiff));;
    vDiffLine->setFixedWidth(55);
    vDiffLine->setMaxLength(4);

    QWidget *audioWidget = new QWidget(this);
    audioWidget->setStyleSheet("color:white");
    colLayout=new QVBoxLayout();

    lineLayout=new QHBoxLayout();
    lineLayout->addStretch();
    lineLayout->addWidget(l15);
    lineLayout->addWidget(vDiffLine);
    lineLayout->addWidget(l16);
    lineLayout->addStretch();
    colLayout->addLayout(lineLayout);

    lineLayout=new QHBoxLayout();
    lineLayout->addStretch();
    lineLayout->addWidget(l17);
    lineLayout->addWidget(fallSpeedLine);
    lineLayout->addStretch();
    lineLayout->addWidget(l18);
    lineLayout->addWidget(noteIntervalLine);
    lineLayout->addStretch();
    lineLayout->addWidget(l19);
    lineLayout->addWidget(holdTimeLine);
    lineLayout->addStretch();
    lineLayout->addWidget(l20);
    lineLayout->addWidget(offsetLine);
    lineLayout->addStretch();
    lineLayout->addWidget(l21);
    lineLayout->addWidget(clickIntervalLine);
    lineLayout->addStretch();
    lineLayout->addWidget(l22);
    lineLayout->addWidget(holdIntervalLine);
    lineLayout->addStretch();
    colLayout->addLayout(lineLayout);

    audioWidget->setLayout(colLayout);
    mainLayout->addWidget(audioWidget);

    centralWidget->setLayout(mainLayout);
    setCentralWidget(centralWidget);

    this->setStyleSheet("background-color: black;");
    buttonStyle = "QPushButton{ background-color: #466666; color: white; font-weight: bold;}"
            "QPushButton:hover{ background-color: #799999; color: white; }"
         "QPushButton:pressed { background-color: #ACCCCC; color: white; }";
    unselectedStyle = "QPushButton{ background-color: #555555; color: white; text-decoration: line-through;}"
                "QPushButton:hover{ background-color: #888888; color: white; }"
             "QPushButton:pressed { background-color: #BBBBBB; color: white; }";
    selectedStyle = "QPushButton{ background-color: #BABE8D; color: black; font-weight: bold;}"
              "QPushButton:hover{ background-color: #EBEFB2; color: black; }"
           "QPushButton:pressed { background-color: #FEFFD6; color: black; }";
    selectVideoButton->setStyleSheet(buttonStyle);
    selectOutPathButton->setStyleSheet(buttonStyle);
    exportButton -> setStyleSheet(buttonStyle);
    selectAudioButton->setStyleSheet(unselectedStyle);
    defaultAudioButton->setStyleSheet(selectedStyle);
    selectImageButton->setStyleSheet(unselectedStyle);
    defaultImageButton->setStyleSheet(selectedStyle);

    EnglishButton->setStyleSheet(unselectedStyle);
    ChineseButton->setStyleSheet(selectedStyle);
    bwButton->setStyleSheet(unselectedStyle);
    greyButton->setStyleSheet(selectedStyle);

    mainLayout->addWidget(selectVideoButton);
    mainLayout->addWidget(selectOutPathButton);
    mainLayout->addWidget(exportButton);

    connect(selectVideoButton,&QPushButton::clicked, this, &MainWindow::selectVideo);
    connect(selectOutPathButton,&QPushButton::clicked, this, &MainWindow::selectOutPath);
    connect(selectAudioButton,&QPushButton::clicked, this, &MainWindow::selectAudio);
    connect(defaultAudioButton,&QPushButton::clicked, this, &MainWindow::defaultAudio);
    connect(selectImageButton,&QPushButton::clicked, this, &MainWindow::selectImage);
    connect(defaultImageButton,&QPushButton::clicked, this, &MainWindow::defaultImage);
    connect(exportButton,&QPushButton::clicked, this, &MainWindow::exportNew);
    connect(ChineseButton,&QPushButton::clicked, this, &MainWindow::Chinese);
    connect(EnglishButton,&QPushButton::clicked, this, &MainWindow::English);
    connect(bwButton,&QPushButton::clicked, this, &MainWindow::bw);
    connect(greyButton,&QPushButton::clicked, this, &MainWindow::grey);

    process = new QProcess(this);
    process->setProcessChannelMode(QProcess::MergedChannels);

    connect(process, QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished),
                   this, &MainWindow::onProcessFinished);
    connect(process, &QProcess::readyReadStandardOutput, this, &MainWindow::onProcessOutput);
    connect(process, &QProcess::readyReadStandardError, this, &MainWindow::onProcessOutput);
    connect(this, &MainWindow::updateOutput, outputTextEdit, &QTextEdit::append);

    QObject::connect(this, &MainWindow::processDone, [=](const QString& program) {
        emit updateOutput("==========");
        if(program=="ffmpeg")//if done converting to mp3, proceed to convert mp3 to waveform for beat detection
        {
            qDebug()<<"done ffmpeg"<<endl;
            emit updateOutput(text[23]);

            QStringList arguments;
            arguments << "-i" << audioPath<<"-o"<<"wave.json"<<"--pixels-per-second"<<QString::number(pixelPerSec);
            runProcess("audiowaveform",arguments);
        }
        else if(program=="audiowaveform")//if done converting mp3 to waveform, proceed to detect beats and then write chart.
        {
            qDebug()<<"done audiowaveform"<<endl;
            emit updateOutput(text[24]);

            if(useDefaultImage)
                getImage();//save a random frame as png
            parseVideo();//generate fake notes.
            parseAudio();
            writeChart();
            
            QStringList arguments;
            arguments << "a" << "-tzip"<<exportPath<<"chart.json"<<imagePath<<audioPath;
            runProcess("7z",arguments);
        }
        else if(program=="7z")//if done zipping, the whole export process is done.
        {
            qDebug()<<"Done."<<endl;
            emit updateOutput(text[25]+QString::number(totalFakeNotes));
            emit updateOutput(text[26]+QString::number(totalRealNotes));
            emit updateOutput(text[27]+QString::number(totalNoteTypes[0]));
            emit updateOutput(text[28]+QString::number(totalNoteTypes[1]));
            emit updateOutput(text[29]+QString::number(totalNoteTypes[2]));
            emit updateOutput(text[30]+QString::number(totalNoteTypes[3]));
            emit updateOutput(text[31]+QString::number(moveXHori.size()*2+moveXVerti.size()*2));
            emit updateOutput(text[32]+QString::number(moveXHori.size()*2));
            emit updateOutput(text[33]+QString::number(moveXVerti.size()*2));
            emit updateOutput(text[34]+exportPath);
            exportButton->setText(text[35]);
            exportButton->setStyleSheet(buttonStyle);

            disableAll(centralWidget,false);
        }
    });
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::onProcessFinished(int exitCode, QProcess::ExitStatus exitStatus) {
        Q_UNUSED(exitCode);
        Q_UNUSED(exitStatus);
        emit processDone(process->program());
    }

void MainWindow::runProcess(QString program, QStringList arguments) {
    emit updateOutput(text[36]+program);
    emit updateOutput("==========");
    process->start(program, arguments);
}


void MainWindow::onProcessOutput() {
    QProcess *process = qobject_cast<QProcess *>(sender());
    if (process) {
        QByteArray newData = process->readAllStandardOutput();
        qDebug()<<newData<<endl;
        emit updateOutput(QString::fromLocal8Bit(newData));
    }
}

void MainWindow::Chinese()
{
    language="Chinese.txt";
    updateText();
}

void MainWindow::English()
{
    language="English.txt";
    updateText();
}

void MainWindow::bw()
{
    allowGrey=false;
    colorThresholdLine->setText(QString::number(128));
    bwButton->setStyleSheet(selectedStyle);
    greyButton->setStyleSheet(unselectedStyle);
}

void MainWindow::grey()
{
    allowGrey=true;
    colorThresholdLine->setText(QString::number(5));
    bwButton->setStyleSheet(unselectedStyle);
    greyButton->setStyleSheet(selectedStyle);
}

void MainWindow::selectVideo()
{
    QString t = QFileDialog::getOpenFileName(this,tr("OpenFile"));
    if(!t.isNull() && !t.isEmpty())
    {
        videoPath = t;
        selectVideoButton -> setText(videoPath);
        selectVideoButton -> setStyleSheet(selectedStyle);
        if(!exportPath.isNull() && !exportPath.isEmpty())
            exportButton -> setStyleSheet(buttonStyle);
    }
}

void MainWindow::selectOutPath()
{
    QString t = QFileDialog::getSaveFileName(this,
                                    tr("Export"),
                                    QDir::homePath(),
                                    tr("ZIP Files (*.zip)"));
    if(!t.isNull() && !t.isEmpty())
    {
        exportPath = t;
        selectOutPathButton -> setText(exportPath);
        selectOutPathButton -> setStyleSheet(selectedStyle);
        if(!videoPath.isNull() && !videoPath.isEmpty())
            exportButton -> setStyleSheet(buttonStyle);
    }
}

void MainWindow::selectAudio()
{
    QString t = QFileDialog::getOpenFileName(this,tr("OpenFile"));
    if(!t.isNull() && !t.isEmpty())
    {
        useDefaultAudio=false;
        audioPath = t;
        selectAudioButton -> setText(audioPath);
        selectAudioButton -> setStyleSheet(selectedStyle);
        defaultAudioButton -> setStyleSheet(unselectedStyle);
        defaultAudioButton->setDisabled(false);
    }
}

void MainWindow::defaultAudio()
{
    useDefaultAudio=!useDefaultAudio;
    if(useDefaultAudio)
    {
        selectAudioButton -> setStyleSheet(unselectedStyle);
        defaultAudioButton -> setStyleSheet(selectedStyle);
    }
    else
    {
        if(selectAudioButton->text()!=text[37])
            selectAudioButton -> setStyleSheet(selectedStyle);
        else
            selectAudioButton -> setStyleSheet(buttonStyle);
        defaultAudioButton -> setStyleSheet(unselectedStyle);
    }
}

void MainWindow::selectImage()
{
    QString t = QFileDialog::getOpenFileName(this,tr("OpenFile"));
    if(!t.isNull() && !t.isEmpty())
    {
        useDefaultImage=false;
        imagePath = t;
        selectImageButton -> setText(imagePath);
        selectImageButton -> setStyleSheet(selectedStyle);
        defaultImageButton -> setStyleSheet(unselectedStyle);
        defaultImageButton->setDisabled(false);
    }
}

void MainWindow::defaultImage()
{
    useDefaultImage=!useDefaultImage;
    if(useDefaultImage)
    {
        selectImageButton -> setStyleSheet(unselectedStyle);
        defaultImageButton -> setStyleSheet(selectedStyle);
    }
    else
    {
        if(selectImageButton->text()!=text[38])
            selectImageButton -> setStyleSheet(selectedStyle);
        else
            selectImageButton -> setStyleSheet(buttonStyle);
        defaultImageButton -> setStyleSheet(unselectedStyle);
    }
}

void MainWindow::parseAudio()
{
    fixedHoriLine.clear();
    fixedVertiLine.clear();
    movingHoriLine.clear();
    movingVertiLine.clear();
    moveXHori.clear();
    moveXVerti.clear();

    //int threshold = volumeThreshold;
    if(!QFile(audioPath).exists())
    {
        qWarning()<<"audio file ["<<audioPath<<"] missing"<<endl;
        return;
    }

    QString val;
    QFile waveF;
    waveF.setFileName("wave.json");
    waveF.open(QIODevice::ReadOnly | QIODevice::Text);
    if(!waveF.isOpen())
    {
        qWarning()<<"failed to analyze audio file.";
        return;
    }
    val = waveF.readAll();
    waveF.close();
    QJsonObject jsonObj = QJsonDocument::fromJson(val.toUtf8()).object();
    int channels = jsonObj.value(QString("channels")).toInt();
    int length = jsonObj.value(QString("length")).toInt();
    QJsonArray rawData = jsonObj.value(QString("data")).toArray();
    QVector<int>data(length);//volume at each point.
    for(int i=0,j=0;i<length;i++,j+=channels*2) //only care about channel 0, even if there are more than one channel.
    {
        data[i]=rawData[j+1].toInt()-rawData[j].toInt();//the volume at this point.
    }

    int maxI=0;//a local max where a note may be inserted.
    int max=0;//the value at the local max.
    int minI=0;
    int min=0;
    int prevMaxI= -99999;
    pattern_t prevType{1,0,0,false,0,0,-1,-1,vertiMax,horiOuterMax,false};

    for(int i=offset;i<length;i++)
    {
        int val = data[i];

        //if(max>vDiff*min && max>vDiff*val && max>threshold && maxI>minI && maxI-prevMaxI>noteInterval)
        if(max>vDiff*min && max>vDiff*val && maxI>minI && maxI-prevMaxI>noteInterval)
        {
            prevType=pattern(maxI,i,val, prevType);

            prevMaxI=maxI;

            maxI=i+1;
            minI=i+1;
            max=data[i+1];
            min=data[i+1];
        }
        else if(val>max)
        {
            max=val;
            maxI=i;
        }
        else if(val<min)
        {
            min=val;
            minI=i;
        }
     }
    qDebug()<<"done parsing audio."<<endl;
    emit updateOutput(text[39]);
}

pattern_t MainWindow::pattern(int maxI, int minI, int val, pattern_t prevP)
{
    quint32 rand = QRandomGenerator::global()->generate();
    pattern_t newP = prevP;
    newP.val=val;
    int interval = (prevP.noteType==1?clickInterval:holdInterval);
    if(minI-maxI>holdTime) //if it's a long note
    {
        bool flickEnd=rand%2;
        newP.endI=minI;

        if(maxI-prevP.endI<interval) //if too close, start with drags at the same location.
        {
            if(newP.verti)
            {
                float x = prevP.vertiX;
                for(int t=maxI;t<minI;t+=dragInterval)
                {
                    fixedVertiLine.append(note_t{ 4, true, x, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel, 255});
                }

                if(flickEnd)
                {
                    fixedVertiLine.append(note_t{ 3, true, x, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel,255});
                    newP.noteType=3;
                }
                else
                    newP.noteType=4;
            }
            else
            {
                float x = prevP.followHold?prevP.horiX:prevP.horiNoteX;
                for(int t=maxI;t<minI;t+=dragInterval)
                {
                    fixedHoriLine.append(note_t{ 4, true, x, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel, 255});
                }

                if(flickEnd)
                {
                    fixedHoriLine.append(note_t{ 3, true, x, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel, 255});
                    newP.noteType=3;
                }
                else
                    newP.noteType=4;
            }
        }
        else
        {
            newP.verti = (rand%2==0);
            bool moving = (minI-maxI>holdTime*2 || rand%3==0);//if very long, certainly move; else, there's a chance.
            newP.followHold=true;
            if(newP.verti)
            {
                movingVertiLine.append(note_t{ 2, true, 0, maxI/pixelPerSec, fmod(maxI,pixelPerSec)*msPerPixel, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel,255});
            }
            else
            {
                movingHoriLine.append(note_t{ 2, true, 0, maxI/pixelPerSec, fmod(maxI,pixelPerSec)*msPerPixel, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel,255});
            }
            newP.noteType=2;

            if(moving)
            {
                if(newP.verti)
                {
                    float maxX=vertiMax;
                    float x=prevP.vertiX;
                    float startX=x;
                    int t=maxI;
                    int startT=t;
                    int dir = prevP.vertiDir;
                    for(;t<minI;t+=dragInterval)
                    {
                        fixedVertiLine.append(note_t{ 4, true, x, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel,255});

                        x+=dir*xInc;
                        if(x<=-maxX)
                        {
                            x=-maxX;
                            dir=1;
                            moveXVerti.append(moveX_t{startX,x,startT/pixelPerSec,fmod(startT,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel});
                            startX=x;
                            startT=t;
                        }
                        if(x>=maxX)
                        {
                            x=maxX;
                            dir=-1;
                            moveXVerti.append(moveX_t{startX,x,startT/pixelPerSec,fmod(startT,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel});
                            startX=x;
                            startT=t;
                        }
                    }
                    t+=dragInterval;
                    moveXVerti.append(moveX_t{startX,x,startT/pixelPerSec,fmod(startT,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel});
                    newP.vertiDir=dir;
                    newP.vertiX=x;
                    newP.vertiNoteX=x;
                }
                else
                {
                    float maxX=horiInnerMax;
                    float x = prevP.horiX;
                    float startX=x;
                    int startT=maxI;
                    int t=startT;
                    int dir = prevP.horiDir;
                    for(;t<minI;t+=dragInterval)
                    {

                        fixedHoriLine.append(note_t{ 4, true, x, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel,255});

                        x+=dir*xInc;
                        if(x<=-maxX)
                        {
                            x=-maxX;
                            dir=1;
                            moveXHori.append(moveX_t{startX,x,startT/pixelPerSec,fmod(startT,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel});
                            startX=x;
                            startT=t;
                        }
                        if(x>=maxX)
                        {
                            x=maxX;
                            dir=-1;
                            moveXHori.append(moveX_t{startX,x,startT/pixelPerSec,fmod(startT,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel});
                            startX=x;
                            startT=t;
                        }
                    }
                    t+=dragInterval;
                    moveXHori.append(moveX_t{startX,x,startT/pixelPerSec,fmod(startT,pixelPerSec)*msPerPixel, t/pixelPerSec, fmod(t,pixelPerSec)*msPerPixel});
                    newP.horiDir=dir;
                    newP.horiX=x;
                    newP.horiNoteX=x;
                }
            }
            if(flickEnd)
            {
                newP.noteType=3;
                if(newP.verti)
                    movingVertiLine.append(note_t{3, true, 0, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel,255});
                else
                    movingHoriLine.append(note_t{4, true, 0, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel, minI/pixelPerSec, fmod(minI,pixelPerSec)*msPerPixel,255});
            }
        }
    }
    else
    {
        newP.endI=maxI;
        if(maxI-prevP.endI<interval) //if too close, start with a drag at the same location.
        {
            newP.noteType=4;
            if(newP.verti)
            {
                float x = prevP.followHold?prevP.vertiX:prevP.vertiNoteX;
                fixedVertiLine.append(note_t{ 4, true, x, maxI/pixelPerSec, fmod(maxI,pixelPerSec)*msPerPixel, maxI/pixelPerSec, fmod(maxI,pixelPerSec)*msPerPixel,255});
            }
            else
            {
                float x = prevP.followHold?prevP.horiX:prevP.horiNoteX;
                fixedHoriLine.append(note_t{ 4, true, x, maxI/pixelPerSec, fmod(maxI,pixelPerSec)*msPerPixel, maxI/pixelPerSec, fmod(maxI,pixelPerSec)*msPerPixel,255});
            }
        }
        else
        {
            newP.verti=false;
            newP.noteType=1;
            newP.followHold=false;

            if(prevP.noteType==1)
            {
                if(val>prevP.val)
                {
                    if(prevP.horiNoteX==horiOuterMax)
                        newP.horiNoteX=horiInnerMax;
                    else
                        newP.horiNoteX-=xInc;
                    if(newP.horiNoteX<-horiInnerMax)
                        newP.horiNoteX=-horiOuterMax;
                }
                else
                {
                    if(prevP.horiNoteX==-horiOuterMax)
                        newP.horiNoteX=-horiInnerMax;
                    else
                        newP.horiNoteX+=xInc;
                    if(newP.horiNoteX>horiInnerMax)
                        newP.horiNoteX=horiOuterMax;
                }
            }
            else
            {
                newP.horiNoteX=horiOuterMax;
            }
            fixedHoriLine.append(note_t{ 1, true, newP.horiNoteX, maxI/pixelPerSec, fmod(maxI,pixelPerSec)*msPerPixel, maxI/pixelPerSec, fmod(maxI,pixelPerSec)*msPerPixel,255});
        }
    }

    return newP;
}

void MainWindow::parseVideo()
{
    for(int i=0;i<57;i++)
    {
        fakeLines[i].clear();
    }

    int prev[57][89]{{0}};
    int s0[57][89]{{0}};
    float ms0[57][89]{{0}};

    cv::VideoCapture capture(videoPath.toStdString());
    if(!capture.isOpened())
    {
        qWarning()<<"can't open video file"<<endl;
        return;
    }

    cv::Mat rawFrame;
    cv::Mat frame;
    int frameN=capture.get(cv::CAP_PROP_FRAME_COUNT);
    int fpsMs=0,fpsMsMax=1000/fpsMax;
    double rate = capture.get(cv::CAP_PROP_FPS);
    qDebug()<<"rate:"<<rate<<endl;
    emit updateOutput(text[40]+QString::number(rate)+text[41]+QString::number(fpsMax));
    double delay=1000.0/rate;
    int s=0;
    double ms=0;
    int rows=57,cols=89;
    while(capture.read(rawFrame)&&frameN>0)
    {
        fpsMs-=int(delay);

        if(fpsMs<=0||frameN==1)
        {
            fpsMs=fpsMsMax;

            cv::Mat resizedFrame;
            cv::resize(rawFrame, resizedFrame, cv::Size(89,57));
            cv::cvtColor(resizedFrame,frame, cv::COLOR_BGR2GRAY);

            for(int y=0;y<rows;y++)
            {
                uchar *data = frame.ptr<uchar>(y);
                for(int x=0;x<cols;x++)
                {
                    int val = data[x];
                    int val_prev=prev[y][x];
                    val=allowGrey?val:val<colorThreshold?0:255;
                    if(abs(val_prev-val)>=colorThreshold)
                    {
                        if(val_prev>0)
                        {
                            fakeLines[y].append(note_t{4,false,float(-484+11*x),s0[y][x],ms0[y][x],s,ms,val_prev});
                        }
                        if(val>0)
                        {
                            s0[y][x]=s;
                            ms0[y][x]=ms;
                        }
                        prev[y][x]=val;
                    }
                }
            }
        }

        frameN--;
        ms+=delay;
        if(ms>1000)
        {
            s+=int(ms)/1000;
            ms=ms-int(ms)+int(ms)%1000;
        }
    }
    qDebug()<<"done parsing video frames."<<endl;
    emit updateOutput(text[42]);
}

void MainWindow::getImage()
{
    system("del image.png");
    cv::VideoCapture capture(videoPath.toStdString());
    imagePath = "image.png";
    int frameN = capture.get(cv::CAP_PROP_FRAME_COUNT);
    int frameI = QRandomGenerator::global()->generate() % frameN;
    capture.set(cv::CAP_PROP_POS_FRAMES, frameI);
    cv::Mat img;
    capture.read(img);
    cv::imwrite(imagePath.toStdString(), img);
    qDebug()<<"done selecting random image."<<endl;
    emit updateOutput(text[43]);
}

void MainWindow::writeChart()
{
    ofstream tF("chart.json");

    tF<<readAll("META.txt");
    tF<<"      \"background\" : \""<<imagePath.toStdString()<<"\","<<endl;
    tF<<"      \"charter\" : \""<<charter.toStdString()<<"\","<<endl;
    tF<<"      \"composer\" : \""<<composer.toStdString()<<"\","<<endl;
    tF<<"      \"id\" : \"99999999\","<<endl;
    tF<<"      \"level\" : \""<<level.toStdString()<<"\","<<endl;
    tF<<"      \"name\" : \""<<name.toStdString()<<"\","<<endl;
    tF<<"      \"offset\" : 0,"<<endl;
    tF<<"      \"song\" : \""<<audioPath.toStdString()<<"\""<<endl;


    tF<<readAll("fixL.txt");
    int notesN=fixedVertiLine.size();
    if(notesN>0)                      //left fixed
    {
        tF<<"         \"notes\" : ["<<endl;
        for(int i=0;i<notesN;i++)
        {
            tF<<noteToStr(fixedVertiLine.at(i))<<(i+1<notesN?",":"")<<endl;
        }
        tF<<"         ],"<<endl;
    }
    tF<<"         \"numOfNotes\" : "<<notesN<<","<<endl;
    tF<<readAll("fixLR.txt");
    if(notesN>0)                     //right fixed
    {
        tF<<"         \"notes\" : ["<<endl;
        for(int i=0;i<notesN;i++)
        {
            tF<<noteToStr(fixedVertiLine.at(i))<<(i+1<notesN?",":"")<<endl;
        }
        tF<<"         ],"<<endl;
    }
    tF<<"         \"numOfNotes\" : "<<notesN<<","<<endl;
    tF<<readAll("fixRU.txt");
    notesN=fixedHoriLine.size();
    if(notesN>0)                     //upper fixed
    {
        tF<<"         \"notes\" : ["<<endl;
        for(int i=0;i<notesN;i++)
        {
            tF<<noteToStr(fixedHoriLine.at(i))<<(i+1<notesN?",":"")<<endl;
        }
        tF<<"         ],"<<endl;
    }
    tF<<"         \"numOfNotes\" : "<<notesN<<","<<endl;
    tF<<readAll("fixUD.txt");
    if(notesN>0)                     //lower fixed
    {
        tF<<"         \"notes\" : ["<<endl;
        for(int i=0;i<notesN;i++)
        {
            tF<<noteToStr(fixedHoriLine.at(i))<<(i+1<notesN?",":"")<<endl;
        }
        tF<<"         ],"<<endl;
    }
    tF<<"         \"numOfNotes\" : "<<notesN<<","<<endl;
    tF<<readAll("fixD_moveL.txt");
    int moveN=moveXVerti.size();
    if(moveN>0)
    {
        for(int i=0;i<moveN;i++)
        {
            tF<<moveXToStr(moveXVerti.at(i),true);
        }
    }
    else
    {
        qDebug()<<"no moveX verti"<<endl;
    }
    tF<<readAll("moveL.txt");
    notesN=movingVertiLine.size();
    if(notesN>0)
    {
        tF<<"         \"notes\" : ["<<endl;
        for(int i=0;i<notesN;i++)
        {
            tF<<noteToStr(movingVertiLine.at(i))<<(i+1<notesN?",":"")<<endl;
        }
        tF<<"         ],"<<endl;
    }
    tF<<"         \"numOfNotes\" : "<<notesN<<","<<endl;
    tF<<readAll("moveLR.txt");
    if(moveN>0)
    {
        for(int i=0;i<moveN;i++)
        {
            tF<<moveXToStr(moveXVerti.at(i),false);
        }
    }
    tF<<readAll("moveR.txt");
    if(notesN>0)
    {
        tF<<"         \"notes\" : ["<<endl;
        for(int i=0;i<notesN;i++)
        {
            tF<<noteToStr(movingVertiLine.at(i))<<(i+1<notesN?",":"")<<endl;
        }
        tF<<"         ],"<<endl;
    }
    tF<<"         \"numOfNotes\" : "<<notesN<<","<<endl;
    tF<<readAll("moveRU.txt");
    moveN=moveXHori.size();
    if(moveN>0)
    {
        for(int i=0;i<moveN;i++)
        {
            tF<<moveXToStr(moveXHori.at(i),true);
        }
    }
    else
    {
        qDebug()<<"no moveX hori"<<endl;
    }
    tF<<readAll("moveU.txt");
    notesN=movingHoriLine.size();
    if(notesN>0)
    {
        tF<<"         \"notes\" : ["<<endl;
        for(int i=0;i<notesN;i++)
        {
            tF<<noteToStr(movingHoriLine.at(i))<<(i+1<notesN?",":"")<<endl;
        }
        tF<<"         ],"<<endl;
    }
    tF<<"         \"numOfNotes\" : "<<notesN<<","<<endl;
    tF<<readAll("moveUD.txt");
    moveN=moveXHori.size();
    if(moveN>0)
    {
        for(int i=0;i<moveN;i++)
        {
            tF<<moveXToStr(moveXHori.at(i),false);
        }
    }
    tF<<readAll("moveD.txt");
    if(notesN>0)
    {
        tF<<"         \"notes\" : ["<<endl;
        for(int i=0;i<notesN;i++)
        {
            tF<<noteToStr(movingHoriLine.at(i))<<(i+1<notesN?",":"")<<endl;
        }
        tF<<"         ],"<<endl;
    }
    tF<<readAll("moveD2.txt");

    for(int y=280,i=0;y>=-280;y-=10,i++)
    {
        tF<<lineToStr(y,i,text[44].toStdString()+to_string(y))<<(y>-280?",":"")<<endl;
    }

    tF<<"   ]"<<endl;
    tF<<"}"<<endl;

    tF.close();
    emit updateOutput(text[45]);
}

double MainWindow::getNum(QLineEdit *l,double defaultVal,double min, double max)
{
    bool valid;
    double x=l->text().toDouble(&valid);
    if(valid)
    {
        if(x<min)
            x=min;
        else if(x>max)
            x=max;
    }
    else
        x=defaultVal;
    l->setText(QString::number(x));
    return x;
}

void MainWindow::exportNew()
{
    outputTextEdit -> clear();//clear output field.

    exportButton->setStyleSheet(selectedStyle);
    exportButton->setText(text[46]);

    disableAll(centralWidget,true);

    totalFakeNotes=0;
    totalRealNotes=0;
    totalNoteTypes[0]=0;
    totalNoteTypes[1]=0;
    totalNoteTypes[2]=0;
    totalNoteTypes[3]=0;

    name=nameLine->text();
    composer=composerLine->text();
    charter=charterLine->text();
    level=levelLine->text();

    fpsMax=getNum(fpsMaxLine,10,numeric_limits<double>::min(),qInf());
    colorThreshold=getNum(colorThresholdLine,5,1,255);

    vDiff=getNum(vDiffLine,3,1,qInf());
    fallSpeed=getNum(fallSpeedLine,0.25,0,qInf());
    offset=getNum(offsetLine,2,1,qInf())*pixelPerSec;
    noteInterval=getNum(noteIntervalLine,0.2,0,qInf())*pixelPerSec;
    holdTime=getNum(holdTimeLine,0.5,0,qInf())*pixelPerSec;
    clickInterval=getNum(clickIntervalLine,0.25,0,qInf())*pixelPerSec;
    holdInterval=getNum(holdIntervalLine,0.5,0,qInf())*pixelPerSec;

    if(!useDefaultAudio&&selectAudioButton->text()==text[47])
    {
        defaultAudio();
    }
    if(!useDefaultImage&&selectImageButton->text()==text[48])
    {
        defaultImage();
    }

    if(useDefaultAudio)//if using default audio, finish converting to mp3 in another thread before generating waveform for beat detection.
    {
        system("del music.mp3");//delete it first, in case it already exists.
        audioPath="music.mp3";
        QStringList arguments;
        arguments << "-i" << videoPath<<audioPath;
        runProcess("ffmpeg",arguments);
    }
    else //else proceed to generate waveform directly.
    {
        QStringList arguments;
        arguments << "-i" << audioPath<<"-o"<<"wave.json"<<"--pixels-per-second"<<QString::number(pixelPerSec);
        runProcess("audiowaveform",arguments);
    }

    //the rest is called after processes are finished in processDone
}

string MainWindow::readAll(string filename)
{
    stringstream t;
    ifstream inF("templates/"+filename);
    string line;
    while(getline(inF,line))
        t<<line<<endl;
    inF.close();
    return t.str();
}

string MainWindow::lineToStr(int y, int id, string name)
{
    stringstream t;
    t<<"      {"<<endl;
    t<<"         \"Group\" : 2,"<<endl;
    t<<"         \"Name\" : \""<<name<<"\","<<endl;
    t<<readAll("fake0.txt");
    t<<"                     \"end\" : "<<y<<".0,"<<endl;
    t<<"                     \"endTime\" : [ 1, 0, 1 ],"<<endl;
    t<<"                     \"linkgroup\" : 0,"<<endl;
    t<<"                     \"start\" : "<<y<<".0,"<<endl;
    t<<readAll("fake1.txt");
    int notesN=fakeLines[id].size();
    if(notesN>0)
    {
        t<<"         \"notes\" : ["<<endl;
        for(int i=0;i<notesN;i++)
        {
            t<<noteToStr(fakeLines[id].at(i))<<(i+1<notesN?",":"")<<endl;
        }
        t<<"         ],"<<endl;
    }
    t<<"         \"numOfNotes\" : "<<notesN<<","<<endl;
    t<<readAll("fake2.txt");
    return t.str();
}

string MainWindow::noteToStr(note_t n)
{
    if(n.real)
    {
        totalRealNotes++;
        totalNoteTypes[n.type-1]++;
    }
    else
        totalFakeNotes++;

    stringstream t;
    t<<"            {"<<endl;
    t<<"               \"above\" : 1,"<<endl;
    t<<"               \"alpha\" : "<<n.alpha<<","<<endl;
    t<<"               \"endTime\" : [ "<<int(n.endS)<<", "<<int(n.endMS)<<", 1000 ],"<<endl;
    t<<"               \"isFake\" : "<<(n.real?"0":"1")<<","<<endl;
    t<<"               \"positionX\" : "<<n.x<<","<<endl;
    t<<"               \"size\" : "<<(n.real?"1":"0.07")<<","<<endl;
    t<<"               \"speed\" : "<<(n.real?to_string(fallSpeed):"0.0")<<","<<endl;
    if(n.type==2)//if hold
        t<<"               \"startTime\" : [ "<<int(n.startS)<<", "<<int(n.startMS)<<", 1000 ],"<<endl;
    else
        t<<"               \"startTime\" : [ "<<int(n.endS)<<", "<<int(n.endMS)<<", 1000 ],"<<endl;
    t<<"               \"type\" : "<<n.type<<","<<endl;
    if(n.real)
        t<<"               \"visibleTime\" : 999999.0,"<<endl;
    else
        t<<"               \"visibleTime\" : "<<(n.endS-n.startS+(n.endMS-n.startMS)/1000.0)<<","<<endl;
    t<<"               \"yOffset\" : 0.0"<<endl;
    t<<"            }";
    return t.str();
}

string MainWindow::moveXToStr(moveX_t m, bool rev)
{
    stringstream t;
    t<<readAll("moveX.txt");
    t<<"                     \"end\" : "<<(rev?m.endX:-m.endX)<<","<<endl;
    t<<"                     \"endTime\" : [ "<<int(m.endS)<<", "<<int(m.endMS)<<", 1000 ],"<<endl;
    t<<"                     \"linkgroup\" : 0,"<<endl;
    t<<"                     \"start\" : "<<(rev?m.startX:-m.startX)<<","<<endl;
    t<<"                     \"startTime\" : [ "<<int(m.startS)<<", "<<int(m.startMS)<<", 1000 ]"<<endl;
    t<<"                  }"<<endl;
    return t.str();
}

void MainWindow::disableAll(QWidget *w, bool disable)
{
    const QObjectList& children = w->children();
    for (QObject* obj : children) {
        // Check if the child widget is a QPushButton or a QLineEdit
        if (QPushButton* button = qobject_cast<QPushButton*>(obj)) {
            // Disable the QPushButton
            button->setDisabled(disable);
        } else if (QLineEdit* lineEdit = qobject_cast<QLineEdit*>(obj)) {
            // Disable the QLineEdit
            lineEdit->setDisabled(disable);
        } else if (QWidget* childWidget = qobject_cast<QWidget*>(obj)) {
            // Recursively disable buttons and line edits in child widgets
            disableAll(childWidget,disable);
        }
    }
}

QStringList MainWindow::getTextArray(const QString &filePath)
{
    QStringList lines;

    QFile file(filePath);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        qDebug() << "File could not be opened: " << file.errorString();
        return lines;
    }

    QTextStream in(&file);
    in.setCodec("UTF-8");
    while (!in.atEnd()) {
        QString line = in.readLine();
        lines.append(line);
    }

    file.close();
    return lines;
}

void MainWindow::updateText()
{
    text=getTextArray(language);

    if(selectVideoButton->styleSheet()!=selectedStyle)
        selectVideoButton->setText(text[0]);
    if(selectOutPathButton->styleSheet()!=selectedStyle)
        selectOutPathButton->setText(text[1]);
    exportButton->setText(text[2]);
    if(selectAudioButton->styleSheet()!=selectedStyle)
        selectAudioButton->setText(text[3]);
    defaultAudioButton->setText(text[4]);
    if(selectImageButton->styleSheet()!=selectedStyle)
        selectImageButton->setText(text[5]);
    defaultImageButton->setText(text[6]);
    l7->setText(text[7]);
    l8->setText(text[8]);
    l9->setText(text[9]);
    l10->setText(text[10]);
    bwButton->setText(text[11]);
    greyButton->setText(text[12]);
    l13->setText(text[13]);
    l14->setText(text[14]);
    l15->setText(text[15]);
    l16->setText(text[16]);
    l17->setText(text[17]);
    l18->setText(text[18]);
    l19->setText(text[19]);
    l20->setText(text[20]);
    l21->setText(text[21]);
    l22->setText(text[22]);
}
