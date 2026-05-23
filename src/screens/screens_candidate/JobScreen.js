import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../Config/supabaseClient";
import { useAuth } from "../../Auth/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const JobScreen = ({ navigation, route }) => {
  const { userSession } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [candidateId, setCandidateId] = useState(null);

  // Quản lý các Job ID đã lưu (Bookmark) - từ SAVED_JOBS table
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Quản lý các Job ID đã ứng tuyển - từ APPLICATIONS table
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  // Trạng thái đóng/mở của Popup Bộ lọc nâng cao
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // --- STATE CÁC BỘ LỌC ĐƯỢC CHỌN ---
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedWorkingModel, setSelectedWorkingModel] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [selectedSalaryBracket, setSelectedSalaryBracket] = useState("");

  // 🛑 THAY ĐỔI: Chuyển state công nghệ sang dạng chữ nhập vào từ bàn phím
  const [techInput, setTechInput] = useState("");

  // Định nghĩa các tùy chọn danh mục cố định trong Popup
  const filterOptions = {
    locations: ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"],
    workingModels: ["Office", "Hybrid", "Remote"],
    jobTypes: ["Full-time", "Part-time"],
    expertises: ["Junior", "Mid-level", "Senior", "Lead"],
    salaries: [
      { label: "Dưới $50k", min: 0, max: 50 },
      { label: "$50k - $100k", min: 50, max: 100 },
      { label: "$100k - $150k", min: 100, max: 150 },
      { label: "Trên $150k", min: 150, max: 999 },
    ],
  };

  const fetchCandidateId = async () => {
    try {
      if (!userSession) {
        setCandidateId(null);
        return;
      }

      const usersId = userSession.id;
      if (!usersId) {
        console.error("userSession.id không có, không thể suy ra candidate_id");
        return;
      }

      const { data, error } = await supabase
        .from("CANDIDATES")
        .select("id")
        .eq("user_id", usersId)
        .single();

      if (error) {
        console.error("Lỗi lấy candidate ID:", error.message, error.details);
        return;
      }

      if (data?.id) {
        setCandidateId(data.id);
      }
    } catch (err) {
      console.error("Lỗi hệ thống fetchCandidateId:", err);
    }
  };

  const fetchSavedJobs = async (cId) => {
    if (!cId) return;
    try {
      const { data, error } = await supabase
        .from("SAVED_JOBS")
        .select("job_id")
        .eq("candidate_id", cId);

      if (error) {
        console.error("Lỗi truy vấn SAVED_JOBS:", error.message);
      } else if (data) {
        setSavedJobIds(data.map((item) => item.job_id));
      }
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    }
  };

  const fetchAppliedJobs = async (cId) => {
    if (!cId) return;
    try {
      const { data, error } = await supabase
        .from("APPLICATIONS")
        .select("job_id")
        .eq("candidate_id", cId);

      if (error) {
        console.error("Lỗi truy vấn APPLICATIONS:", error.message);
      } else if (data) {
        setAppliedJobIds(data.map((item) => item.job_id));
      }
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    }
  };

  const fetchJobPostings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("JOB_POSTINGS")
        .select(
          `
          *,
          COMPANIES (
            name,
            logo_url
          )
        `,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi truy vấn Supabase:", error.message);
      } else if (data) {
        const sortedJobs = [...data].sort((a, b) => {
          const isAUrgent = a.badge?.toLowerCase() === "urgent";
          const isBUrgent = b.badge?.toLowerCase() === "urgent";
          if (isAUrgent && !isBUrgent) return -1;
          if (!isAUrgent && isBUrgent) return 1;
          return 0;
        });
        setJobs(sortedJobs);
        setFilteredJobs(sortedJobs);
      }
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateId();
    fetchJobPostings();
  }, [userSession]);

  // Hydrate bộ lọc từ HomeScreen khi user bấm "Tìm kiếm việc làm"
  useEffect(() => {
    const initialSearch = route?.params?.initialSearch;
    if (!initialSearch) return;

    const keyword = initialSearch.keyword ? String(initialSearch.keyword) : "";
    const location = initialSearch.location
      ? String(initialSearch.location)
      : "";
    const company = initialSearch.company ? String(initialSearch.company) : "";
    const skills = initialSearch.skills ? String(initialSearch.skills) : "";

    // map vào logic sẵn có của JobScreen
    // - keyword sẽ đổ vào ô search (lọc title + name company)
    // - skills sẽ đổ vào techInput (lọc theo expertise)
    // - location/workingModel/jobType hiện chưa có dropdown tương ứng hoàn toàn,
    //   nên ở đây chỉ đổ location vào selectedLocation nếu match đúng giá trị chip
    setSearch(keyword || company || "");

    // ưu tiên location nếu có
    setSelectedLocation(location || "");

    // skills
    setTechInput(skills || "");
  }, [route?.params?.initialSearch]);

  // ✅ FIX CHUẨN: khi quay lại JobScreen từ JobDetail (hủy/ứng tuyển), re-fetch applied/saved

  useFocusEffect(
    useCallback(() => {
      if (!candidateId) return;
      fetchSavedJobs(candidateId);
      fetchAppliedJobs(candidateId);

      // cũng recompute UI theo filters hiện tại
      // (appliedJobIds thay đổi => nút sẽ update đúng)
      return undefined;
    }, [candidateId]),
  );

  const parseSalaryRange = (salaryString) => {
    if (!salaryString) return { min: 0, max: 0 };
    const numbers = salaryString.match(/\d+/g);
    if (!numbers) return { min: 0, max: 0 };
    const min = parseInt(numbers[0], 10);
    const max = numbers[1] ? parseInt(numbers[1], 10) : min;
    return { min, max };
  };

  const handleSearchAndFilter = (appliedFilters = null) => {
    let result = [...jobs];

    if (search.trim() !== "") {
      const query = search.toLowerCase();
      result = result.filter((job) => {
        return (
          job.title?.toLowerCase().includes(query) ||
          job.COMPANIES?.name?.toLowerCase().includes(query)
        );
      });
    }

    const loc = appliedFilters ? appliedFilters.location : selectedLocation;
    const model = appliedFilters
      ? appliedFilters.workingModel
      : selectedWorkingModel;
    const type = appliedFilters ? appliedFilters.jobType : selectedJobType;
    const exp = appliedFilters ? appliedFilters.expertise : selectedExpertise;
    const salBracket = appliedFilters
      ? appliedFilters.salaryBracket
      : selectedSalaryBracket;
    const targetTech = appliedFilters ? appliedFilters.techSkill : techInput;

    if (loc)
      result = result.filter(
        (j) => j.location?.toLowerCase() === loc.toLowerCase(),
      );
    if (model)
      result = result.filter(
        (j) => j.working_model?.toLowerCase() === model.toLowerCase(),
      );
    if (type)
      result = result.filter(
        (j) => j.job_type?.toLowerCase() === type.toLowerCase(),
      );
    if (exp)
      result = result.filter(
        (j) => j.expertise?.toLowerCase() === exp.toLowerCase(),
      );

    if (targetTech.trim() !== "") {
      const queryTech = targetTech.toLowerCase().trim();
      result = result.filter((job) => {
        if (!job.expertise) return false;
        const skillArray = job.expertise
          .split(",")
          .map((s) => s.trim().toLowerCase());
        return skillArray.some((skill) => skill.includes(queryTech));
      });
    }

    if (salBracket) {
      const targetBracket = filterOptions.salaries.find(
        (s) => s.label === salBracket,
      );
      if (targetBracket) {
        result = result.filter((job) => {
          const { min, max } = parseSalaryRange(job.salary_range);
          return max >= targetBracket.min && min <= targetBracket.max;
        });
      }
    }

    setFilteredJobs(result);
  };

  // Tự động cập nhật danh sách khi người dùng tìm nhanh ở ô Search ngoài màn hình chính
  useEffect(() => {
    handleSearchAndFilter();
  }, [
    search,
    jobs,
    selectedLocation,
    selectedWorkingModel,
    selectedJobType,
    selectedExpertise,
    selectedSalaryBracket,
    techInput,
  ]);

  const applyFilters = () => {
    handleSearchAndFilter({
      location: selectedLocation,
      workingModel: selectedWorkingModel,
      jobType: selectedJobType,
      expertise: selectedExpertise,
      salaryBracket: selectedSalaryBracket,
      techSkill: techInput,
    });
    setIsFilterModalVisible(false);
  };

  const resetFilters = () => {
    setSelectedLocation("");
    setSelectedWorkingModel("");
    setSelectedJobType("");
    setSelectedExpertise("");
    setSelectedSalaryBracket("");
    setTechInput("");
    setFilteredJobs(jobs);
    setIsFilterModalVisible(false);
  };

  const toggleBookmark = (jobId) => {
    const isSaved = savedJobIds.includes(jobId);
    if (isSaved) {
      removeSavedJob(jobId);
    } else {
      addSavedJob(jobId);
    }
  };

  const addSavedJob = async (jobId) => {
    if (!candidateId) return;
    try {
      const { error } = await supabase
        .from("SAVED_JOBS")
        .insert([{ candidate_id: candidateId, job_id: jobId }]);

      if (error) {
        console.error("Lỗi thêm saved job:", error.message);
      } else {
        setSavedJobIds((prev) => [...prev, jobId]);
      }
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    }
  };

  const removeSavedJob = async (jobId) => {
    if (!candidateId) return;
    try {
      const { error } = await supabase
        .from("SAVED_JOBS")
        .delete()
        .eq("candidate_id", candidateId)
        .eq("job_id", jobId);

      if (error) {
        console.error("Lỗi xóa saved job:", error.message);
      } else {
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
      }
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    }
  };

  const applyForJob = async (jobId, resumeId = null) => {
    if (!candidateId) {
      console.error("candidateId không tồn tại! Không thể ứng tuyển");
      return;
    }

    try {
      const { data: existed, error: existedErr } = await supabase
        .from("APPLICATIONS")
        .select("id")
        .eq("candidate_id", candidateId)
        .eq("job_id", jobId)
        .maybeSingle();

      if (existedErr) {
        console.error(
          "Lỗi check ứng tuyển trùng:",
          existedErr.message,
          existedErr.details,
        );
      }

      if (existed?.id) {
        setAppliedJobIds((prev) =>
          prev.includes(jobId) ? prev : [...prev, jobId],
        );
        return;
      }

      const { error } = await supabase.from("APPLICATIONS").insert([
        {
          candidate_id: candidateId,
          job_id: jobId,
          resume_id: resumeId,
          status: "pending",
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          console.error("Lỗi: Đã ứng tuyển cho công việc này rồi");
        } else {
          console.error("Lỗi ứng tuyển:", error.message, error.details);
        }
      } else {
        setAppliedJobIds((prev) => [...prev, jobId]);
      }
    } catch (err) {
      console.error("Lỗi hệ thống applyForJob:", err);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedLocation) count++;
    if (selectedWorkingModel) count++;
    if (selectedJobType) count++;
    if (selectedExpertise) count++;
    if (selectedSalaryBracket) count++;
    if (techInput.trim() !== "") count++;
    return count;
  };

  const formatTimeAgo = (createdAtString) => {
    if (!createdAtString) return "Vừa xong";
    const diffHours = Math.floor(
      (new Date() - new Date(createdAtString)) / (1000 * 60 * 60),
    );
    if (diffHours < 1) return "Vừa xong";
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${Math.floor(diffHours / 24)} ngày trước`;
  };

  const renderJobCard = ({ item }) => {
    const companyInfo = item.COMPANIES;
    const isUrgent = item.badge?.toLowerCase() === "urgent";
    const isSaved = savedJobIds.includes(item.id);
    const isApplied = appliedJobIds.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.jobCard, isUrgent && styles.urgentCardBackground]}
        onPress={() =>
          navigation.navigate("JobDetail", { jobId: item.id, from: "job_card" })
        }
      >
        {isUrgent && <View style={styles.urgentTopStrip} />}

        <View style={styles.cardHeader}>
          <View style={styles.companyInfoRow}>
            <View style={styles.companyLogoContainer}>
              <Image
                source={{
                  uri:
                    companyInfo?.logo_url ||
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
                }}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.titleMeta}>
              <View style={styles.jobTitleWrapper}>
                <Text
                  style={[styles.jobTitle, isUrgent && styles.urgentJobTitle]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.badge && (
                  <View
                    style={[
                      styles.badgeLabel,
                      isUrgent
                        ? styles.urgentBadgeLabel
                        : styles.normalBadgeLabel,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeLabelText,
                        isUrgent
                          ? styles.urgentBadgeText
                          : styles.normalBadgeText,
                      ]}
                    >
                      {isUrgent ? "Tuyển Gấp 🔥" : item.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.companyName} numberOfLines={1}>
                {companyInfo?.name || "Công ty công nghệ"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bookmarkBtn}
            onPress={() => toggleBookmark(item.id)}
          >
            <MaterialCommunityIcons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isSaved ? "#b7131a" : "#906f6c"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.badgesWrapper}>
          {item.location && (
            <View style={styles.infoBadge}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color="#5f5e5e"
              />
              <Text style={styles.badgeText}>{item.location}</Text>
            </View>
          )}
          {item.salary_range && (
            <View
              style={[styles.infoBadge, isUrgent && styles.urgentSalaryBadge]}
            >
              <MaterialCommunityIcons
                name="currency-usd"
                size={14}
                color={isUrgent ? "#b7131a" : "#1a1c1c"}
              />
              <Text
                style={[
                  styles.badgeText,
                  isUrgent && styles.urgentSalaryText,
                  !isUrgent && styles.normalSalaryText,
                ]}
              >
                {item.salary_range}
              </Text>
            </View>
          )}
          {item.job_type && (
            <View style={styles.infoBadge}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color="#5f5e5e"
              />
              <Text style={styles.badgeText}>{item.job_type}</Text>
            </View>
          )}
        </View>

        {item.expertise && (
          <View style={styles.skillTagsContainer}>
            {item.expertise.split(",").map((skill, index) => (
              <View key={index} style={styles.skillTagPiece}>
                <Text style={styles.skillTagPieceText}>{skill.trim()}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.timeAgoText}>
            {formatTimeAgo(item.created_at)}
          </Text>
          <TouchableOpacity
            style={[styles.applyButton, isApplied && styles.appliedButton]}
            onPress={() => !isApplied && applyForJob(item.id)}
            disabled={isApplied}
          >
            <Text
              style={[
                styles.applyButtonText,
                isApplied && styles.appliedButtonText,
              ]}
            >
              {isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const activeFiltersCount = getActiveFilterCount();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={true}
      />

      <View style={styles.safeHeaderWrapper}>
        <View style={styles.topAppBar}>
          <View style={styles.appBarLeft}>
            <TouchableOpacity style={styles.iconMenu}>
              <MaterialCommunityIcons name="menu" size={24} color="#1a1c1c" />
            </TouchableOpacity>
            <Text style={styles.brandLogo}>IT RECRUITMENT</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color="#5f5e5e"
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b7131a" />
          <Text style={styles.loadingText}>
            Đang cập nhật việc làm tiêu điểm...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="cloud-search-outline"
                size={64}
                color="#906f6c"
              />
              <Text style={styles.emptyText}>
                Không tìm thấy việc làm nào phù hợp
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View>
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeHeading}>
                  Khám phá cơ hội IT mới
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Hiển thị {filteredJobs.length} việc làm chất lượng cao
                </Text>
              </View>
              <View style={styles.searchRow}>
                <View style={styles.searchBoxContainer}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={22}
                    color="#906f6c"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Vị trí, tên công ty..."
                    placeholderTextColor="#5f5e5e"
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.filterTriggerButton,
                    activeFiltersCount > 0 && styles.filterTriggerActive,
                  ]}
                  onPress={() => setIsFilterModalVisible(true)}
                >
                  <MaterialCommunityIcons
                    name="tune"
                    size={22}
                    color={activeFiltersCount > 0 ? "#ffffff" : "#1a1c1c"}
                  />
                  {activeFiltersCount > 0 && (
                    <View style={styles.filterBadgeIndicator}>
                      <Text style={styles.filterBadgeText}>
                        {activeFiltersCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Bộ lọc nâng cao</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#1a1c1c"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalScrollArea}
            >
              <Text style={styles.filterGroupTitle}>
                Kỹ năng chuyên môn (Ví dụ: Java, Flutter...)
              </Text>
              <View style={styles.techInputContainer}>
                <MaterialCommunityIcons
                  name="xml"
                  size={20}
                  color="#906f6c"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.techTextInputField}
                  placeholder="Nhập ngôn ngữ..."
                  placeholderTextColor="#9e9e9e"
                  value={techInput}
                  onChangeText={setTechInput}
                />
                {techInput.length > 0 && (
                  <TouchableOpacity onPress={() => setTechInput("")}>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={18}
                      color="#9e9e9e"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.filterGroupTitle}>Mức lương mong muốn</Text>
              <View style={styles.chipGroupRow}>
                {filterOptions.salaries.map((sal) => (
                  <TouchableOpacity
                    key={sal.label}
                    style={[
                      styles.popupChip,
                      selectedSalaryBracket === sal.label &&
                        styles.popupChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedSalaryBracket(
                        selectedSalaryBracket === sal.label ? "" : sal.label,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.popupChipText,
                        selectedSalaryBracket === sal.label &&
                          styles.popupChipTextSelected,
                      ]}
                    >
                      {sal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterGroupTitle}>Địa điểm làm việc</Text>
              <View style={styles.chipGroupRow}>
                {filterOptions.locations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.popupChip,
                      selectedLocation === loc && styles.popupChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedLocation(selectedLocation === loc ? "" : loc)
                    }
                  >
                    <Text
                      style={[
                        styles.popupChipText,
                        selectedLocation === loc &&
                          styles.popupChipTextSelected,
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterGroupTitle}>Mô hình công việc</Text>
              <View style={styles.chipGroupRow}>
                {filterOptions.workingModels.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.popupChip,
                      selectedWorkingModel === m && styles.popupChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedWorkingModel(
                        selectedWorkingModel === m ? "" : m,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.popupChipText,
                        selectedWorkingModel === m &&
                          styles.popupChipTextSelected,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterGroupTitle}>Cấp bậc tuyển dụng</Text>
              <View style={styles.chipGroupRow}>
                {filterOptions.expertises.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[
                      styles.popupChip,
                      selectedExpertise === e && styles.popupChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedExpertise(selectedExpertise === e ? "" : e)
                    }
                  >
                    <Text
                      style={[
                        styles.popupChipText,
                        selectedExpertise === e && styles.popupChipTextSelected,
                      ]}
                    >
                      {e}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitFilterButton}
                onPress={applyFilters}
              >
                <Text style={styles.submitFilterButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fabButton}>
        <MaterialCommunityIcons name="bell-plus" size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  safeHeaderWrapper: {
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 4 : 0,
    borderBottomWidth: 1,
    borderColor: "#e2e2e2",
  },
  topAppBar: {
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  appBarLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconMenu: { padding: 4 },
  brandLogo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#b7131a",
    letterSpacing: -0.5,
  },
  notificationBtn: { padding: 4 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: { color: "#5f5e5e", fontSize: 14, fontWeight: "500" },
  listContent: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 16 },
  welcomeSection: { marginBottom: 16 },
  welcomeHeading: { fontSize: 20, fontWeight: "700", color: "#1a1c1c" },
  welcomeSubtitle: { fontSize: 14, color: "#5f5e5e", marginTop: 4 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  searchBoxContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4beb9",
    paddingHorizontal: 14,
    height: 52,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#1a1c1c" },
  filterTriggerButton: {
    width: 52,
    height: 52,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4beb9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterTriggerActive: { backgroundColor: "#b7131a", borderColor: "#b7131a" },
  filterBadgeIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#1a1c1c",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: { color: "#ffffff", fontSize: 10, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#eeeeee",
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: "700", color: "#1a1c1c" },
  modalScrollArea: { marginBottom: 20 },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1c1c",
    marginTop: 14,
    marginBottom: 10,
  },
  chipGroupRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  techInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  techTextInputField: { flex: 1, fontSize: 14, color: "#1a1c1c" },
  popupChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  popupChipSelected: { backgroundColor: "#fff2f2", borderColor: "#b7131a" },
  popupChipText: { fontSize: 13, color: "#5f5e5e", fontWeight: "500" },
  popupChipTextSelected: { color: "#b7131a", fontWeight: "700" },
  modalFooterActions: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderColor: "#eeeeee",
    paddingTop: 16,
  },
  resetButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
  },
  resetButtonText: { color: "#5f5e5e", fontSize: 14, fontWeight: "600" },
  submitFilterButton: {
    flex: 2,
    height: 48,
    backgroundColor: "#b7131a",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  submitFilterButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: { fontSize: 16, fontWeight: "700", color: "#1a1c1c" },
  jobCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#212121",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  urgentCardBackground: {
    backgroundColor: "#fff9f9",
    borderWidth: 1,
    borderColor: "#ffb4af",
  },
  urgentTopStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#b7131a",
  },
  urgentJobTitle: { color: "#b7131a" },
  urgentBadgeLabel: { backgroundColor: "#b7131a" },
  urgentBadgeText: { color: "#ffffff" },
  urgentSalaryBadge: { backgroundColor: "#ffdad6" },
  urgentSalaryText: { color: "#b7131a", fontWeight: "700" },
  normalSalaryText: { color: "#1a1c1c", fontWeight: "700" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  companyInfoRow: { flexDirection: "row", gap: 12, flex: 1 },
  companyLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#eeeeee",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  companyLogo: {
    width: 46,
    height: 46,
    borderRadius: 8,
  },
  titleMeta: { flex: 1 },
  jobTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1c1c",
    maxWidth: "70%",
  },
  badgeLabel: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  normalBadgeLabel: { backgroundColor: "#f3f3f3" },
  badgeLabelText: { fontSize: 10, fontWeight: "bold" },
  normalBadgeText: { color: "#5f5e5e" },
  companyName: { fontSize: 14, color: "#5f5e5e", marginTop: 2 },
  bookmarkBtn: { padding: 6 },
  badgesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: { fontSize: 11, color: "#5f5e5e", fontWeight: "500" },
  skillTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
    marginTop: 4,
  },
  skillTagPiece: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  skillTagPieceText: { fontSize: 11, color: "#5f5e5e", fontWeight: "500" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  timeAgoText: { fontSize: 11, color: "#906f6c" },
  applyButton: {
    backgroundColor: "#b7131a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  appliedButton: {
    backgroundColor: "#9e9e9e",
  },
  applyButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "600" },
  appliedButtonText: { color: "#ffffff", fontWeight: "600" },
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 16,
    backgroundColor: "#b7131a",
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default JobScreen;
